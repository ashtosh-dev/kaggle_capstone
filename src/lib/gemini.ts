import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error('GEMINI_API_KEY environment variable is not set');
}

export const geminiClient = new GoogleGenAI({
  apiKey,
});

export const MODEL_ID = 'gemini-2.0-flash-exp';

export async function generateWithGemini(
  prompt: string,
  systemPrompt: string,
  temperature: number = 0.7
): Promise<string> {
  try {
    const response = await geminiClient.models.generateContent({
      model: MODEL_ID,
      contents: {
        role: 'user',
        parts: [{ text: prompt }],
      },
      systemInstruction: systemPrompt,
      generationConfig: {
        temperature,
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 4096,
      },
    });

    const text =
      response.content.parts[0].kind === 'text'
        ? response.content.parts[0].text
        : '';

    return text;
  } catch (error: any) {
    console.error('Gemini API error:', error);
    
    if (error?.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    
    if (error?.status === 401) {
      throw new Error('Invalid API key');
    }
    
    throw new Error(error?.message || 'Failed to generate content');
  }
}
