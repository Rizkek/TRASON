import { supabase } from '../supabase/supabaseClient';
import { handleQueryError, logError } from '@/libs/apiErrors';
import { RECEIPT_BUCKET } from '@/libs/receiptStorage';

export const storageQueries = {
  /**
   * Upload an avatar image to the 'avatars' bucket.
   * Compresses the image on the client side if necessary, but we expect
   * the File object passed here to be ready.
   */
  async uploadAvatar(userId: string, file: File): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `profile_${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      // Upload the file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatar')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL for the uploaded image
      const { data } = supabase.storage
        .from('avatar')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (err) {
      logError(err, 'storageQueries.uploadAvatar');
      throw handleQueryError(err);
    }
  },

  /**
   * Short-lived link to one of the user's own receipt images. The receipts bucket is private,
   * so this is the only way the browser can display one; storage RLS limits it to the owner.
   */
  async getReceiptSignedUrl(path: string, expiresInSeconds = 600): Promise<string> {
    try {
      const { data, error } = await supabase.storage.from(RECEIPT_BUCKET).createSignedUrl(path, expiresInSeconds);
      if (error || !data) throw error ?? new Error('No signed URL returned');
      return data.signedUrl;
    } catch (err) {
      logError(err, 'storageQueries.getReceiptSignedUrl');
      throw handleQueryError(err);
    }
  },

  /**
   * (Optional) Delete an avatar by path if we want to clean up old avatars
   */
  async deleteAvatar(path: string): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from('avatar')
        .remove([path]);

      if (error) throw error;
    } catch (err) {
      logError(err, 'storageQueries.deleteAvatar');
      throw handleQueryError(err);
    }
  }
};
