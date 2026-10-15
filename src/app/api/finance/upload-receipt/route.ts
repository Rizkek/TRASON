import { NextResponse } from 'next/server';
import { createClient, getAuthenticatedUser } from '@/utils/supabase/server';
import { ALLOWED_RECEIPT_MIME_TYPES, MAX_RECEIPT_BYTES, sanitizeReceiptFileName } from '@/libs/receiptStorage';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('receipt') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No receipt file provided.' }, { status: 400 });
    }

    if (!ALLOWED_RECEIPT_MIME_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'File must be a JPEG, PNG, WebP or HEIC image.' }, { status: 400 });
    }

    if (file.size > MAX_RECEIPT_BYTES) {
      return NextResponse.json({ error: 'Image is too large (max 10 MB).' }, { status: 413 });
    }

    const supabase = await createClient();
    const uuid = crypto.randomUUID();
    const fileName = `${user.id}/${uuid}-${sanitizeReceiptFileName(file.name)}`;

    const { data, error } = await supabase.storage
      .from('receipts')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error('Supabase storage error:', error);
      throw new Error('Failed to upload image to storage.');
    }

    const { data: publicUrlData } = supabase.storage
      .from('receipts')
      .getPublicUrl(fileName);

    return NextResponse.json({
      path: data.path,
      url: publicUrlData.publicUrl,
      fileName,
    });
  } catch (error: any) {
    console.error('Error in upload-receipt API route:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
