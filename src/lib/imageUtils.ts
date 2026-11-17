/**
 * Utility to compress and validate user uploaded avatar/profile images
 * Enforces a strict file size limit (e.g., max 2MB) and compresses the image
 * to high-quality JPEG under 150KB for fast loading & permanent storage.
 */

export const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024; // 2MB max input

export function compressAndEncodeImage(
  file: File,
  maxWidth = 400,
  maxHeight = 400,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      reject(new Error(`File size exceeds 2MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB). Please choose a smaller photo.`));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Invalid or corrupted image file.'));
      img.onload = () => {
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Canvas context unavailable.'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Compress and resample an image file into a JPEG Blob.
 * Used when uploading real files to Supabase Storage (avoids storing
 * large base64 strings in the database).
 */
export function compressImageToBlob(
  file: File,
  maxWidth = 1200,
  maxHeight = 800,
  quality = 0.85
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      reject(new Error(`File size exceeds 2MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB). Please choose a smaller photo.`));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Invalid or corrupted image file.'));
      img.onload = () => {
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Canvas context unavailable.'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Image encoding failed.'));
              return;
            }
            resolve(blob);
          },
          'image/jpeg',
          quality
        );
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}
