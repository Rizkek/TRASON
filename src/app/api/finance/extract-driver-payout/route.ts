import { NextResponse } from 'next/server';
import { GeminiReceiptExtractor } from '@/services/ai/receiptExtractor';
import { driverPayoutExtractionSchema } from '@/services/ai/driverPayoutExtractor';
import { getAuthenticatedUser } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
  }

  try {
    const { receiptUrl } = await req.json();
    if (typeof receiptUrl !== 'string') {
      return NextResponse.json({ error: 'A receipt image URL is required.' }, { status: 400 });
    }

    const imageUrl = new URL(receiptUrl);
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) throw new Error('Supabase storage is not configured.');

    const storageOrigin = new URL(supabaseUrl).origin;
    const ownedReceiptPrefix = `/storage/v1/object/public/receipts/${user.id}/`;
    if (imageUrl.origin !== storageOrigin || !imageUrl.pathname.startsWith(ownedReceiptPrefix)) {
      return NextResponse.json({ error: 'The image must be uploaded to your TRASON receipts.' }, { status: 400 });
    }

    const extractor = new GeminiReceiptExtractor();
    const result = await extractor.extractJSON(
      imageUrl.toString(),
      driverPayoutExtractionSchema,
      'Read the driver earnings or payout screenshot. Extract only values explicitly shown: date, gross fare/earnings before deductions, service payment or platform fee, VAT/tax, tip, net payout received, and currency. Do not calculate, infer, or guess missing values. Return null for every amount that is not clearly shown. Amounts must be numeric without currency symbols or thousands separators.'
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