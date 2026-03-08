/**
 * Compress an image file before upload.
 * Returns original file for videos or small images.
 */
export const compressImage = (file: File, maxWidth = 1600, quality = 0.8): Promise<File> => {
  // Skip non-images
  if (!file.type.startsWith('image/')) return Promise.resolve(file);
  // Skip small files (< 500KB)
  if (file.size < 500 * 1024) return Promise.resolve(file);

  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      let { width, height } = img;
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob && blob.size < file.size) {
            resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() }));
          } else {
            resolve(file); // compressed is bigger, keep original
          }
        },
        'image/jpeg',
        quality,
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };
    img.src = url;
  });
};
