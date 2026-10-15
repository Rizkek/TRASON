import { generateObject } from 'ai';
import { z } from 'zod';
import { VisionProvider, VisionExtractionResult } from './visionProvider';
import { aiModels } from './provider';

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
  async extractJSON<T>(
    imageUrlOrBase64: string,
    schema: any, // Zod schema
    prompt: string
  ): Promise<VisionExtractionResult<T>> {
    try {
      // Only inline data URLs are accepted: fetching arbitrary URLs from the server would be an SSRF vector.
      if (!imageUrlOrBase64.startsWith('data:image/')) {
        throw new Error('Only base64 image data URLs are supported.');
      }
      const [header, base64] = imageUrlOrBase64.split(',');
      const mimeType = header.replace('data:', '').replace(';base64', '');

      const { object } = await generateObject({
        model: aiModels.vision(),
        schema: schema,
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
        data: object as unknown as T,
        raw: object,
        confidence: (object as any).confidence || 0.8,
        provider: aiModels.getProviderName(),
      };
    } catch (error: any) {
      console.error('Gemini extraction error:', error);
      return {
        data: null,
        raw: null,
        confidence: 0,
        provider: aiModels.getProviderName(),
        error: error.message || 'Failed to extract JSON from image',
      };
    }
  }
}
