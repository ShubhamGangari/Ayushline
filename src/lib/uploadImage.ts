import { supabase, isSupabaseConfigured } from './supabase';
import { compressImageToBlob, compressAndEncodeImage } from './imageUtils';

export const UPLOAD_BUCKET = 'images';

export interface UploadResult {
  url: string;
  isRemote: boolean;
}

/**
 * Process a user-selected image file:
 *  - Compresses it (max 2MB input -> small JPEG)
 *  - If Supabase is configured, uploads the real file to the Storage bucket
 *    and returns the public CDN URL. The database only ever stores this small URL.
 *  - If Supabase is NOT configured, falls back to a compact base64 data URL
 *    (local/browser mode).
 *
 * This avoids storing large base64 blobs in the database, which otherwise
 * inflates table rows and can crash the database under many uploads.
 */
export async function uploadImage(
  file: File,
  folder: string,
  maxWidth = 1200,
  maxHeight = 800,
  quality = 0.85
): Promise<UploadResult> {
  if (!isSupabaseConfigured || !supabase) {
    const dataUrl = await compressAndEncodeImage(file, maxWidth, maxHeight, quality);
    return { url: dataUrl, isRemote: false };
  }

  const blob = await compressImageToBlob(file, maxWidth, maxHeight, quality);

  const cleanFolder = folder.replace(/[^a-z0-9-_]/gi, '').toLowerCase() || 'uploads';
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.jpg`;
  const path = `${cleanFolder}/${name}`;

  try {
    const { error: uploadError } = await supabase.storage
      .from(UPLOAD_BUCKET)
      .upload(path, blob, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.warn('Storage bucket upload failed, falling back to compressed local format:', uploadError.message);
      const dataUrl = await compressAndEncodeImage(file, maxWidth, maxHeight, quality);
      return { url: dataUrl, isRemote: false };
    }

    const { data } = supabase.storage.from(UPLOAD_BUCKET).getPublicUrl(path);
    return { url: data.publicUrl, isRemote: true };
  } catch (err: any) {
    console.warn('Storage exception, falling back to compressed local format:', err?.message);
    const dataUrl = await compressAndEncodeImage(file, maxWidth, maxHeight, quality);
    return { url: dataUrl, isRemote: false };
  }
}
