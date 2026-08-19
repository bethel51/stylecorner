/**
 * Helper to compress image on client-side before sending to Cloudinary.
 * Solves Android high-res camera uploads (15MB+ JPEGs) that exceed upload limits or fail on mobile.
 */
export const compressImage = (file, maxWidth = 1200, maxHeight = 1200, quality = 0.82) => {
  return new Promise((resolve) => {
    if (!file || !file.type || !file.type.startsWith('image/')) {
      return resolve(file);
    }

    const reader = new FileReader();
    reader.onerror = () => resolve(file);
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => resolve(file);
      img.onload = () => {
        let width = img.width;
        let height = img.height;

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
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) return resolve(file);
            const compressedFile = new File(
              [blob],
              (file.name || 'upload.jpg').replace(/\.[^/.]+$/, '') + '.jpg',
              { type: 'image/jpeg', lastModified: Date.now() }
            );
            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });
};

/**
 * Upload file to Cloudinary with compression & error handling
 */
export const uploadToCloudinary = async (file) => {
  let fileToUpload = file;
  try {
    fileToUpload = await compressImage(file);
  } catch (err) {
    console.warn('Canvas compression skipped, uploading original file:', err);
  }

  const formData = new FormData();
  formData.append('file', fileToUpload);
  formData.append('upload_preset', 'nmep3opt');

  const res = await fetch('https://api.cloudinary.com/v1_1/NM/image/upload', {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || 'Image upload failed');
  }

  return data.secure_url;
};
