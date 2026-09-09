import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { VisionProvider, VisionExtractionResult } from './visionProvider';

export const receiptItemSchema = z.object({
  name: z.string(),
  quantity: z.number().default(1),
  unit_price: z.number().optional(),
  total: z.number(),
});

export const receiptExtractionSchema = z.object({
  merchant: z.string().optional(),
  date: z.string().optional(), // YYYY-MM-DD
  total: z.number(),
  currency: z.string().optional(),
  items: z.array(receiptItemSchema),
  confidence: z.number().min(0).max(1),
});

export type ExtractedReceipt = z.infer<typeof receiptExtractionSchema>;

export class GeminiReceiptExtractor implements VisionProvider {
  async extractJSON<ExtractedReceipt>(
    imageUrl: string,
    schema: any, // We'll just pass receiptExtractionSchema from outside or ignore
    prompt: string
  ): Promise<VisionExtractionResult<ExtractedReceipt>> {
    try {
      // For Vercel AI SDK, we can pass image URLs if the model supports it.
      // Gemini 1.5 Flash supports image URLs or base64. 
      // If we have a public URL, we fetch it and pass as base64 or pass the URL directly.
      
      // Let's fetch the image and convert to base64 to ensure Gemini can read it.
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error(`Failed to fetch image from ${imageUrl}`);
      }
      const arrayBuffer = await imageResponse.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg';

      const { object } = await generateObject({
        model: google('gemini-2.5-flash'),
        schema: receiptExtractionSchema,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image', image: `data:${mimeType};base64,${base64}` }
            ]
          }
        ]
      });

      return {
        data: object as unknown as ExtractedReceipt,
        raw: object,
        confidence: object.confidence || 0.8,
        provider: 'gemini-2.5-flash',
      };
    } catch (error: any) {
      console.error('Gemini extraction error:', error);
      return {
        data: null,
        raw: null,
        confidence: 0,
        provider: 'gemini-2.5-flash',
        error: error.message || 'Failed to extract JSON from image',
      };
    }
  }
}
