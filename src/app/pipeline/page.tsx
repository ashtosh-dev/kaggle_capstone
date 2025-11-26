"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, FileText, Lightbulb, Image, TrendingUp, CheckCircle2, Upload, File } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

type FormData = {
  paperContent: string
  targetAudience: string
  tone: string
  keywords: string
}

type PipelineResult = {
  analysis?: any
  simplified?: any
  visuals?: any
  optimized?: any
}

export default function PipelinePage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isUploadingFile, setIsUploadingFile] = useState(false)
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)
  const [result, setResult] = useState<PipelineResult>({})
  const [error, setError] = useState<string | null>(null)
  
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormData>()
  const paperContent = watch("paperContent")

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png", "image/webp"]
    if (!validTypes.includes(file.type)) {
      toast.error("Unsupported file type. Please upload a PDF or image file (JPEG, PNG, WebP).")
      return
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      toast.error("File is too large. Please upload a file smaller than 10MB.")
      return
    }

    setIsUploadingFile(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/process-file", {
        method: "POST",
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to process file")
      }

      const data = await response.json()
      setValue("paperContent", data.text)
      setUploadedFileName(data.fileName)
      toast.success(`Successfully extracted text from ${data.fileName}`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to process file"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsUploadingFile(false)
    }
  }

  const onSubmit = async (data: FormData) => {
    setIsProcessing(true)
    setError(null)
    setResult({})

    try {
      // Step 1: Analyze Paper
      setCurrentStep(1)
      const analyzeRes = await fetch("/api/analyze-paper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paperContent: data.paperContent })
      })
      
      if (!analyzeRes.ok) throw new Error("Failed to analyze paper")
      const analysis = await analyzeRes.json()
      setResult(prev => ({ ...prev, analysis }))

      // Step 2: Simplify Content
      setCurrentStep(2)
      const simplifyRes = await fetch("/api/simplify-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          analysis, 
          targetAudience: data.targetAudience,
          tone: data.tone 
        })
      })
      
      if (!simplifyRes.ok) throw new Error("Failed to simplify content")
      const simplified = await simplifyRes.json()
      setResult(prev => ({ ...prev, simplified }))

      // Step 3: Generate Visuals
      setCurrentStep(3)
      const visualsRes = await fetch("/api/generate-visuals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysis, simplified })
      })
      
      if (!visualsRes.ok) throw new Error("Failed to generate visuals")
      const visuals = await visualsRes.json()
      setResult(prev => ({ ...prev, visuals }))

      // Step 4: Optimize for SEO
      setCurrentStep(4)
      const optimizeRes = await fetch("/api/optimize-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          simplified, 
          visuals,
          keywords: data.keywords 
        })
      })
      
      if (!optimizeRes.ok) throw new Error("Failed to optimize post")
      const optimized = await optimizeRes.json()
      setResult(prev => ({ ...prev, optimized }))

      // Complete - Store in localStorage and redirect
      setCurrentStep(5)
      localStorage.setItem("blogPost", JSON.stringify(optimized))
      setTimeout(() => router.push("/"), 1500)

    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setIsProcessing(false)
    }
  }

  const steps = [
    { id: 1, name: "Paper Analysis", icon: FileText, description: "Extracting key findings & methodology" },
    { id: 2, name: "Simplification", icon: Lightbulb, description: "Translating to plain English" },
    { id: 3, name: "Visual Design", icon: Image, description: "Generating diagrams & images" },
    { id: 4, name: "SEO Optimization", icon: TrendingUp, description: "Enhancing discoverability" },
    { id: 5, name: "Complete", icon: CheckCircle2, description: "Blog post ready!" }
  ]

  const progress = (currentStep / 5) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Research Paper to Blog Post</h1>
          <p className="text-muted-foreground text-lg">Transform complex research into engaging content</p>
        </div>

        {!isProcessing ? (
          <Card>
            <CardHeader>
              <CardTitle>Input Research Paper</CardTitle>
              <CardDescription>Upload a file or paste your research paper content</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Tabs defaultValue="upload" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="upload">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload File
                    </TabsTrigger>
                    <TabsTrigger value="paste">
                      <FileText className="w-4 h-4 mr-2" />
                      Paste Text
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="upload" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="file-upload">Upload PDF or Image</Label>
                      <div className="flex items-center gap-4">
                        <Input
                          id="file-upload"
                          type="file"
                          accept=".pdf,image/jpeg,image/jpg,image/png,image/webp"
                          onChange={handleFileUpload}
                          disabled={isUploadingFile}
                          className="cursor-pointer"
                        />
                        {isUploadingFile && (
                          <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Supported formats: PDF, JPEG, PNG, WebP (max 10MB)
                      </p>
                      {uploadedFileName && (
                        <Alert>
                          <File className="w-4 h-4" />
                          <AlertDescription>
                            Extracted text from: <strong>{uploadedFileName}</strong>
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>

                    {paperContent && (
                      <div className="space-y-2">
                        <Label htmlFor="extracted-content">Extracted Content</Label>
                        <Textarea
                          id="extracted-content"
                          className="min-h-[200px] font-mono text-sm"
                          {...register("paperContent", { required: "Paper content is required" })}
                        />
                        {errors.paperContent && (
                          <p className="text-sm text-destructive">{errors.paperContent.message}</p>
                        )}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="paste" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="paperContent">Research Paper Content *</Label>
                      <Textarea
                        id="paperContent"
                        placeholder="Paste the full text of your research paper here..."
                        className="min-h-[200px] font-mono text-sm"
                        {...register("paperContent", { required: "Paper content is required" })}
                      />
                      {errors.paperContent && (
                        <p className="text-sm text-destructive">{errors.paperContent.message}</p>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="targetAudience">Target Audience</Label>
                    <Input
                      id="targetAudience"
                      placeholder="e.g., General public, Tech enthusiasts"
                      defaultValue="General public"
                      {...register("targetAudience")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tone">Tone</Label>
                    <Input
                      id="tone"
                      placeholder="e.g., Casual, Professional, Engaging"
                      defaultValue="Engaging"
                      {...register("tone")}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="keywords">SEO Keywords (comma-separated)</Label>
                  <Input
                    id="keywords"
                    placeholder="e.g., artificial intelligence, machine learning, research"
                    {...register("keywords")}
                  />
                </div>

                <Button type="submit" size="lg" className="w-full" disabled={!paperContent || isUploadingFile}>
                  Start Pipeline
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Processing Pipeline</span>
                    <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                <div className="mt-8 space-y-4">
                  {steps.map((step) => {
                    const Icon = step.icon
                    const isComplete = currentStep > step.id
                    const isActive = currentStep === step.id
                    
                    return (
                      <div
                        key={step.id}
                        className={`flex items-start gap-4 p-4 rounded-lg border transition-all ${
                          isActive
                            ? "border-primary bg-primary/5"
                            : isComplete
                            ? "border-green-500/50 bg-green-50 dark:bg-green-950/20"
                            : "border-border bg-muted/30"
                        }`}
                      >
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : isComplete
                            ? "bg-green-500 text-white"
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {isActive ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Icon className="w-5 h-5" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{step.name}</h3>
                          <p className="text-sm text-muted-foreground">{step.description}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </div>
    </div>
  )
}