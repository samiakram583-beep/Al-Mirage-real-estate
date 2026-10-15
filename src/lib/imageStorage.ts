import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Compresses an image File using HTML5 canvas to a reasonable resolution and quality,
 * returning a lightweight persistent Base64 Data URL.
 */
export async function compressImageToDataUrl(
  file: File,
  maxWidth = 1600,
  maxHeight = 1200,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const rawResult = readerEvent.target?.result as string;
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(rawResult);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => {
        resolve(rawResult);
      };
      img.src = rawResult;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads an image file:
 * 1. Attempts to upload to Supabase Storage bucket 'property-images'.
 * 2. If bucket exists and upload succeeds, returns the permanent public URL.
 * 3. If Supabase Storage is not set up or throws an error (e.g. Bucket not found),
 *    falls back to a compressed persistent Base64 Data URL.
 *
 * This guarantees the image is NEVER a dead transient `blob:` URL,
 * NEVER breaks on page reload, and always displays correctly!
 */
export async function uploadPropertyPhoto(
  file: File,
  propertyId = 'listing'
): Promise<{ url: string; storagePath: string }> {
  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const cleanBaseName = file.name
    .replace(/\.[^/.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-');
  const fileName = `${propertyId}-${Date.now()}-${cleanBaseName}.${fileExt}`;
  const filePath = `property-images/${fileName}`;

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.storage
        .from('property-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (!error && data?.path) {
        const { data: urlData } = supabase.storage
          .from('property-images')
          .getPublicUrl(data.path);

        if (urlData?.publicUrl) {
          return {
            url: urlData.publicUrl,
            storagePath: data.path,
          };
        }
      } else if (error) {
        console.warn('Supabase storage upload notice, using persistent compressed image:', error.message);
      }
    } catch (e: any) {
      console.warn('Supabase storage exception, using persistent compressed image:', e?.message);
    }
  }

  // Robust persistent fallback: Base64 data URL
  const dataUrl = await compressImageToDataUrl(file);
  return {
    url: dataUrl,
    storagePath: filePath,
  };
}
