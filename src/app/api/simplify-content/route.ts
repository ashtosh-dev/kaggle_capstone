import { NextResponse } from "next/server"
import { generateWithGemini } from "@/lib/gemini"

export async function POST(request: Request) {
  try {
    const { analysis, targetAudience, tone } = await request.json()

    if (!analysis) {
      return NextResponse.json(
        { error: "Analysis data is required" },
        { status: 400 }
      )
    }

    const systemPrompt = `You are a content simplification agent. Your job is to translate complex research into engaging, easy-to-understand blog content.

Output ONLY valid JSON with this exact structure:
{
  "title": "engaging blog title",
  "hook": "attention-grabbing opening hook",
  "introduction": "2-3 paragraph introduction",
  "sections": [
    {
      "heading": "section heading",
      "content": "simplified section content with paragraphs"
    }
  ],
  "callToAction": "engaging call to action",
  "readingTime": "X min read",
  "targetAudience": "audience type",
  "tone": "tone style"
}

Make content accessible, engaging, and easy to understand for the target audience.`

    const prompt = `Transform this research analysis into an engaging blog post:

**Analysis:**
${JSON.stringify(analysis, null, 2)}

**Target Audience:** ${targetAudience}
**Tone:** ${tone}

Create simplified content that:
1. Makes technical concepts accessible
2. Engages the target audience
3. Maintains accuracy while simplifying
4. Uses clear section headings
5. Includes an engaging hook and introduction
6. Ends with a strong call to action

Output in JSON format with at least 4 sections covering: what the research is about, key discoveries, methodology, and why it matters.`

    const response = await generateWithGemini(prompt, systemPrompt, 0.7)
    
    // Parse JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Invalid response format from AI")
    }
    
    const simplified = JSON.parse(jsonMatch[0])
    
    // Calculate reading time if not provided
    if (!simplified.readingTime) {
      const wordCount = JSON.stringify(simplified).split(/\s+/).length
      const minutes = Math.ceil(wordCount / 200)
      simplified.readingTime = `${minutes} min read`
    }

    return NextResponse.json(simplified)

  } catch (error: any) {
    console.error("Error simplifying content:", error)
    return NextResponse.json(
      { error: error.message || "Failed to simplify content" },
      { status: 500 }
    )
  }
}