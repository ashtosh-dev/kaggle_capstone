import { NextResponse } from "next/server"
import { generateWithGemini } from "@/lib/gemini"

export async function POST(request: Request) {
  try {
    const { simplified, visuals, keywords } = await request.json()

    if (!simplified || !visuals) {
      return NextResponse.json(
        { error: "Simplified content and visuals are required" },
        { status: 400 }
      )
    }

    const keywordList = keywords?.split(',').map((k: string) => k.trim()).filter(Boolean) || 
                       ['research', 'science', 'innovation']

    const systemPrompt = `You are an SEO and engagement optimization agent. Your job is to optimize blog content for search engines and reader engagement.

Output ONLY valid JSON with this exact structure:
{
  "seo": {
    "title": "SEO optimized title (50-60 chars)",
    "metaDescription": "meta description (150-160 chars)",
    "keywords": ["keyword1", "keyword2"],
    "slug": "url-slug",
    "ogTitle": "Open Graph title",
    "ogDescription": "OG description",
    "ogImage": "image URL",
    "twitterCard": "summary_large_image"
  },
  "content": {
    "title": "blog title",
    "subtitle": "subtitle",
    "heroImage": {},
    "introduction": "intro text",
    "sections": [],
    "visuals": [],
    "infographics": [],
    "callToAction": "CTA text",
    "readingTime": "X min read"
  },
  "engagement": {
    "headlines": ["headline1", "headline2"],
    "pullQuotes": ["quote1", "quote2"],
    "socialSnippets": {
      "twitter": "tweet text",
      "linkedin": "LinkedIn post",
      "facebook": "Facebook post"
    },
    "tags": ["tag1", "tag2"],
    "relatedTopics": ["topic1", "topic2"]
  },
  "readability": {
    "score": "score description",
    "improvements": ["improvement1"],
    "targetScore": "target description"
  },
  "analytics": {
    "estimatedPageViews": "estimate",
    "shareability": "assessment",
    "bounceRateEstimate": "estimate"
  },
  "publishedDate": "ISO date",
  "lastModified": "ISO date"
}

Optimize for search engines while maintaining readability and engagement.`

    const prompt = `Optimize this blog post for SEO and engagement:

**Simplified Content:**
${JSON.stringify(simplified, null, 2)}

**Visuals:**
${JSON.stringify(visuals, null, 2)}

**Keywords:** ${keywordList.join(', ')}

Create:
1. SEO-optimized meta tags and descriptions
2. Engaging social media snippets
3. Alternative headlines
4. Pull quotes from the content
5. Related topics and tags
6. Readability score and improvements
7. Analytics estimates

Ensure the title is under 60 characters and meta description under 160 characters.`

    const response = await generateWithGemini(prompt, systemPrompt, 0.5)
    
    // Parse JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Invalid response format from AI")
    }
    
    const optimized = JSON.parse(jsonMatch[0])
    
    // Ensure dates are set
    const now = new Date().toISOString()
    optimized.publishedDate = optimized.publishedDate || now
    optimized.lastModified = optimized.lastModified || now

    return NextResponse.json(optimized)

  } catch (error: any) {
    console.error("Error optimizing post:", error)
    return NextResponse.json(
      { error: error.message || "Failed to optimize post" },
      { status: 500 }
    )
  }
}