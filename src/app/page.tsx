"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Download, Copy, ArrowRight, FileText, Clock, Tag, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

type BlogPost = {
  seo: any
  content: any
  engagement: any
  readability: any
  publishedDate: string
}

export default function Home() {
  const [blogPost, setBlogPost] = useState<BlogPost | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("blogPost")
    if (stored) {
      setBlogPost(JSON.parse(stored))
    }
  }, [])

  const handleCopy = async () => {
    if (!blogPost) return
    
    const markdown = generateMarkdown(blogPost)
    await navigator.clipboard.writeText(markdown)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    if (!blogPost) return
    
    const markdown = generateMarkdown(blogPost)
    const blob = new Blob([markdown], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${blogPost.seo.slug}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!blogPost) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4">
        <div className="max-w-2xl w-full text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold tracking-tight">
              Research Paper to Blog Post Pipeline
            </h1>
            <p className="text-xl text-muted-foreground">
              Transform complex research into engaging, SEO-optimized blog content with AI agents
            </p>
          </div>

          <Card className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                  <FileText className="w-5 h-5" />
                  <h3 className="font-semibold">Paper Analyzer</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Extracts key findings and methodology
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                  <FileText className="w-5 h-5" />
                  <h3 className="font-semibold">Simplification Agent</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Translates jargon to plain English
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <FileText className="w-5 h-5" />
                  <h3 className="font-semibold">Visual Designer</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Suggests diagrams and image prompts
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                  <FileText className="w-5 h-5" />
                  <h3 className="font-semibold">SEO Optimizer</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Enhances readability and discoverability
                </p>
              </div>
            </div>

            <Link href="/pipeline">
              <Button size="lg" className="w-full">
                Start Pipeline <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/pipeline">
            <Button variant="ghost" size="sm">
              <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
              New Pipeline
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Markdown
                </>
              )}
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-4 py-12">
        <div className="space-y-6 mb-12">
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {blogPost.content.readingTime}
            </div>
            <Separator orientation="vertical" className="h-4" />
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              {blogPost.engagement.tags.slice(0, 3).map((tag: string) => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
            </div>
          </div>

          <h1 className="text-5xl font-bold tracking-tight leading-tight">
            {blogPost.content.title}
          </h1>

          <p className="text-xl text-muted-foreground leading-relaxed">
            {blogPost.content.subtitle}
          </p>

          <div className="relative w-full aspect-video rounded-lg overflow-hidden">
            <Image
              src={blogPost.content.heroImage.url}
              alt={blogPost.content.heroImage.alt}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        <Alert className="mb-8">
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-semibold">SEO Optimized</p>
              <p className="text-sm">
                <strong>Meta Description:</strong> {blogPost.seo.metaDescription}
              </p>
              <p className="text-sm">
                <strong>Keywords:</strong> {blogPost.seo.keywords.join(", ")}
              </p>
              <p className="text-sm">
                <strong>Readability:</strong> {blogPost.readability.score}
              </p>
            </div>
          </AlertDescription>
        </Alert>

        <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
          <p className="text-lg leading-relaxed whitespace-pre-line">
            {blogPost.content.introduction}
          </p>
        </div>

        <div className="space-y-12">
          {blogPost.content.sections.map((section: any, idx: number) => (
            <section key={idx} className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tight">
                {section.heading}
              </h2>
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <div className="text-lg leading-relaxed whitespace-pre-line">
                  {section.content}
                </div>
              </div>

              {blogPost.content.visuals[idx] && (
                <Card className="overflow-hidden">
                  <div className="relative w-full aspect-video">
                    <Image
                      src={blogPost.content.visuals[idx].url}
                      alt={blogPost.content.visuals[idx].description}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground">
                      {blogPost.content.visuals[idx].suggestion}
                    </p>
                  </CardContent>
                </Card>
              )}
            </section>
          ))}
        </div>

        {blogPost.content.infographics?.[0] && (
          <Card className="my-12">
            <CardHeader>
              <h3 className="text-2xl font-bold text-center">
                {blogPost.content.infographics[0].title}
              </h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {blogPost.content.infographics[0].elements.map((element: any, idx: number) => (
                  <div key={idx} className="text-center space-y-2">
                    <p className="text-3xl font-bold text-primary">
                      {element.value}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {element.label}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="prose prose-lg dark:prose-invert max-w-none my-12">
          <div className="text-lg leading-relaxed whitespace-pre-line">
            {blogPost.content.callToAction}
          </div>
        </div>

        <Card className="my-12 bg-muted/50">
          <CardContent className="pt-6">
            <h3 className="text-xl font-bold mb-4">Share This Article</h3>
            <div className="space-y-3">
              <div className="p-4 bg-background rounded-lg">
                <p className="text-sm font-semibold mb-2">Twitter</p>
                <p className="text-sm text-muted-foreground">
                  {blogPost.engagement.socialSnippets.twitter}
                </p>
              </div>
              <div className="p-4 bg-background rounded-lg">
                <p className="text-sm font-semibold mb-2">LinkedIn</p>
                <p className="text-sm text-muted-foreground">
                  {blogPost.engagement.socialSnippets.linkedin}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-12">
          <h3 className="text-xl font-bold mb-4">Related Topics</h3>
          <div className="flex flex-wrap gap-2">
            {blogPost.engagement.relatedTopics.map((topic: string) => (
              <Badge key={topic} variant="outline" className="text-sm py-1">
                {topic}
              </Badge>
            ))}
          </div>
        </div>
      </article>
    </div>
  )
}

function generateMarkdown(blogPost: BlogPost): string {
  let md = `# ${blogPost.content.title}\n\n`
  md += `> ${blogPost.content.subtitle}\n\n`
  md += `![Hero Image](${blogPost.content.heroImage.url})\n\n`
  md += `**Reading Time:** ${blogPost.content.readingTime}\n\n`
  md += `**Tags:** ${blogPost.engagement.tags.join(", ")}\n\n`
  md += `---\n\n`
  md += `## SEO Metadata\n\n`
  md += `- **Meta Description:** ${blogPost.seo.metaDescription}\n`
  md += `- **Keywords:** ${blogPost.seo.keywords.join(", ")}\n`
  md += `- **Slug:** ${blogPost.seo.slug}\n\n`
  md += `---\n\n`
  md += `${blogPost.content.introduction}\n\n`
  
  blogPost.content.sections.forEach((section: any) => {
    md += `## ${section.heading}\n\n`
    md += `${section.content}\n\n`
  })
  
  md += `${blogPost.content.callToAction}\n\n`
  md += `---\n\n`
  md += `**Related Topics:** ${blogPost.engagement.relatedTopics.join(", ")}\n`
  
  return md
}