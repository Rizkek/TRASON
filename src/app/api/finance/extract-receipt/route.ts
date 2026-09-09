import { NextResponse } from 'next/server';
import { getAuthenticatedUser, createClient } from '@/utils/supabase/server';
import { GeminiReceiptExtractor, receiptExtractionSchema } from '@/services/ai/receiptExtractor';
import { validateReceiptDeterministic } from '@/services/finance/capture/captureValidator';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow more time for AI processing on Vercel

export async function POST(req: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
  }

  try {
    const { receiptUrl, transactionId, fileName, mimeType, fileSize } = await req.json();

    if (!receiptUrl || !transactionId) {
      return NextResponse.json({ error: 'Missing required parameters (receiptUrl, transactionId).' }, { status: 400 });
    }

    const supabase = await createClient();

    // 1. Initial metadata insert to indicate processing
    const { error: insertError } = await supabase
      .from('receipt_metadata')
      .insert({
        transaction_id: transactionId,
        user_id: user.id,
        storage_path: fileName || null,
        mime_type: mimeType || null,
        file_size_bytes: fileSize || null,
        extraction_status: 'processing',
      });

    if (insertError) {
      // It's possible the metadata already exists if they retry
      console.warn('Metadata insert issue (might already exist):', insertError);
    }

    // 2. Extract with AI
    const extractor = new GeminiReceiptExtractor();
    const prompt = `Extract the merchant name, date, total amount, and all itemized purchases from this receipt. 
    Ensure the item names are concise and clean. 
    If you see a total but the items don't add up to it (due to tax/service), include tax/service as items if possible, or just extract exactly what's printed. 
    Do not guess amounts.`;

    const result = await extractor.extractJSON(receiptUrl, receiptExtractionSchema, prompt);

    if (result.error || !result.data) {
      // Mark as failed
      await supabase
        .from('receipt_metadata')
        .update({ extraction_status: 'failed' })
        .eq('transaction_id', transactionId);

      return NextResponse.json({ error: 'AI Extraction failed: ' + result.error }, { status: 500 });
    }

    // 3. Deterministic Validation
    const extractedData = result.data as any;
    const validation = validateReceiptDeterministic(extractedData);

    // 4. Update Database
    const { error: updateError } = await supabase
      .from('receipt_metadata')
      .update({
        extraction_status: validation.status,
        confidence_score: result.confidence,
        raw_extraction: result.raw,
        extracted_merchant: extractedData.merchant,
        extracted_date: extractedData.date ? new Date(extractedData.date).toISOString() : null,
        extracted_total: extractedData.total,
        extracted_currency: extractedData.currency,
        sum_of_items: validation.sum_of_items,
        mismatch_amount: validation.mismatch_amount,
        provider: result.provider,
      })
      .eq('transaction_id', transactionId);

    if (updateError) {
      console.error('Failed to update receipt metadata:', updateError);
      throw new Error('Failed to save extraction results to database.');
    }

    // 5. Optionally save items to transaction_items table, but the plan says
    // the user MUST review it first. The ReceiptReview UI will fetch the metadata
    // and then insert items upon user confirmation. So we DO NOT insert items here.

    return NextResponse.json({
      success: true,
      data: result.data,
      validation,
    });
  } catch (error: any) {
    console.error('Error in extract-receipt API route:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
