import { NextResponse } from "next/server"
import { generateWithGemini } from "@/lib/gemini"

export async function POST(request: Request) {
  try {
    const { analysis, simplified } = await request.json()

    if (!analysis || !simplified) {
      return NextResponse.json(
        { error: "Analysis and simplified content are required" },
        { status: 400 }
      )
    }

    const systemPrompt = `You are a visual design agent for blog content. Your job is to suggest visual elements and create detailed image prompts.

Output ONLY valid JSON with this exact structure:
{
  "heroImage": {
    "prompt": "detailed image prompt",
    "url": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=630&fit=crop",
    "alt": "alt text",
    "caption": "image caption"
  },
  "diagrams": [
    {
      "type": "diagram type",
      "description": "what the diagram shows",
      "prompt": "detailed prompt for creating the diagram",
      "url": "https://images.unsplash.com/photo-[id]?w=800&h=600&fit=crop",
      "suggestion": "how to create or what to include"
    }
  ],
  "infographics": [
    {
      "title": "infographic title",
      "elements": [
        {"label": "element label", "value": "element value"}
      ],
      "layout": "grid"
    }
  ],
  "imagePrompts": ["prompt1", "prompt2"],
  "designSuggestions": ["suggestion1", "suggestion2"]
}

Create professional, relevant visual suggestions. Use Unsplash URLs with appropriate photo IDs.`

    const prompt = `Create visual design suggestions for this blog post:

**Analysis:**
${JSON.stringify(analysis, null, 2)}

**Simplified Content:**
${JSON.stringify(simplified, null, 2)}

Generate:
1. Hero image prompt (main visual for the article)
2. 3 diagram/visualization suggestions (methodology flowchart, data visualization, concept illustration)
3. 1 infographic with 4 key statistics/facts
4. 5 additional image prompts
5. 5 design suggestions

Use real Unsplash photo IDs in URLs. Make prompts detailed and specific to the research topic.`

    const response = await generateWithGemini(prompt, systemPrompt, 0.7)
    
    // Parse JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Invalid response format from AI")
    }
    
    const visuals = JSON.parse(jsonMatch[0])

    return NextResponse.json(visuals)

  } catch (error: any) {
    console.error("Error generating visuals:", error)
    return NextResponse.json(
      { error: error.message || "Failed to generate visuals" },
      { status: 500 }
    )
  }
}