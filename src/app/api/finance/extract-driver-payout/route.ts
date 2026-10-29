import { NextResponse } from 'next/server';
import { GeminiReceiptExtractor } from '@/services/ai/receiptExtractor';
import { driverPayoutExtractionSchema } from '@/services/ai/driverPayoutExtractor';
import { createClient, getAuthenticatedUser } from '@/utils/supabase/server';
import { downloadReceiptAsDataUrl, isOwnedReceiptPath } from '@/libs/receiptStorage';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
  }

  try {
    const { receiptPath } = await req.json();
    if (!isOwnedReceiptPath(receiptPath, user.id)) {
      return NextResponse.json({ error: 'The image must be uploaded to your TRASON receipts.' }, { status: 400 });
    }

    const supabase = await createClient();
    const download = await downloadReceiptAsDataUrl(supabase, receiptPath);
    if ('error' in download) {
      return NextResponse.json({ error: download.error }, { status: download.status });
    }
    const { dataUrl } = download;

    const extractor = new GeminiReceiptExtractor();
    const result = await extractor.extractJSON(
      dataUrl,
      driverPayoutExtractionSchema,
      'Read the driver earnings or payout screenshot. Extract only values explicitly shown: date, gross fare/earnings before deductions, service payment or platform fee, VAT/tax, tip, net payout received, distance traveled (in km), and currency. Do not calculate, infer, or guess missing values. Return null for every amount that is not clearly shown. Amounts must be numeric without currency symbols or thousands separators.'
    );

    if (result.error || !result.data) {
      return NextResponse.json({ error: result.error || 'Could not read payout details.' }, { status: 422 });
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      confidence: result.confidence,
      provider: result.provider,
    });
  } catch (error) {
    console.error('Driver payout extraction failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Could not read the payout image.' },
      { status: 500 }
    );
  }
}