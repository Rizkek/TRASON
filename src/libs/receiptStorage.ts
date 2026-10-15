import type { SupabaseClient } from '@supabase/supabase-js';

export const RECEIPT_BUCKET = 'receipts';
export const MAX_RECEIPT_BYTES = 10 * 1024 * 1024;
export const ALLOWED_RECEIPT_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];

/** A receipt path is `<userId>/<file>`; anything else, including traversal segments, is rejected. */
export function isOwnedReceiptPath(path: unknown, userId: string): path is string {
  if (typeof path !== 'string' || path.length > 300 || path.includes('\\')) return false;
  if (!path.startsWith(`${userId}/`)) return false;

  const segments = path.slice(userId.length + 1).split('/');
  return segments.every((segment) => segment !== '' && segment !== '.' && segment !== '..');
}

export function sanitizeReceiptFileName(name: string): string {
  const cleaned = name.replace(/[^A-Za-z0-9._-]/g, '_').replace(/^\.+/, '').slice(-80);
  return cleaned || 'receipt';
}

export type ReceiptDownload = { dataUrl: string; mimeType: string } | { error: string; status: number };

/**
 * Reads a receipt through the caller's own Supabase session (RLS applies) and returns it as a base64 data URL.
 * The server never fetches a URL supplied by the client.
 */
export async function downloadReceiptAsDataUrl(supabase: SupabaseClient, path: string): Promise<ReceiptDownload> {
  const { data, error } = await supabase.storage.from(RECEIPT_BUCKET).download(path);
  if (error || !data) return { error: 'Receipt image not found.', status: 404 };
  if (data.size > MAX_RECEIPT_BYTES) return { error: 'Receipt image is too large.', status: 413 };

  const mimeType = data.type || 'image/jpeg';
  if (!ALLOWED_RECEIPT_MIME_TYPES.includes(mimeType)) return { error: 'Unsupported image type.', status: 415 };

  const base64 = Buffer.from(await data.arrayBuffer()).toString('base64');
  return { dataUrl: `data:${mimeType};base64,${base64}`, mimeType };
}
