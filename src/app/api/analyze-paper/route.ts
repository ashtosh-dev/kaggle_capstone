import { NextResponse } from "next/server"
import { generateWithGemini } from "@/lib/gemini"

export async function POST(request: Request) {
  try {
    const { paperContent } = await request.json()

    if (!paperContent) {
      return NextResponse.json(
        { error: "Paper content is required" },
        { status: 400 }
      )
    }

    const systemPrompt = `You are a research paper analyzer agent. Your job is to extract and analyze key information from academic papers.

Output ONLY valid JSON with this exact structure:
{
  "title": "extracted paper title",
  "abstract": "paper abstract or summary",
  "keyFindings": ["finding 1", "finding 2", "finding 3", "finding 4"],
  "methodology": {
    "approach": "research approach description",
    "dataCollection": "data collection methods",
    "analysis": "analysis methods used"
  },
  "mainTopics": ["topic 1", "topic 2", "topic 3"],
  "technicalTerms": ["term1", "term2", "term3"],
  "conclusions": "main conclusions",
  "citations": 20,
  "wordCount": 0
}

Be thorough and accurate. Extract real information from the paper.`

    const prompt = `Analyze this research paper and extract key information:

${paperContent}

Provide a comprehensive analysis in JSON format.`

    const response = await generateWithGemini(prompt, systemPrompt, 0.3)
    
    // Parse JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Invalid response format from AI")
    }
    
    const analysis = JSON.parse(jsonMatch[0])
    
    // Add word count
    analysis.wordCount = paperContent.split(/\s+/).length

    return NextResponse.json(analysis)

  } catch (error: any) {
    console.error("Error analyzing paper:", error)
    return NextResponse.json(
      { error: error.message || "Failed to analyze paper" },
      { status: 500 }
    )
  }
}