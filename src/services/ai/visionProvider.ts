export interface VisionExtractionResult<T> {
  data: T | null;
  raw: any;
  confidence: number;
  provider: string;
  error?: string;
}

export interface VisionProvider {
  extractJSON<T>(
    imageUrl: string,
    schema: any,
    prompt: string
  ): Promise<VisionExtractionResult<T>>;
}
