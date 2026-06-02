export async function uploadImageToImgBB(file) {
  const apiKey = import.meta.env.VITE_IMGBB_API_KEY;

  if (!apiKey) {
    throw new Error('VITE_IMGBB_API_KEY manquant');
  }

  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`ImgBB error: ${response.status}`);
  }

  const result = await response.json();
  const imageUrl = result?.data?.url;

  if (!result?.success || !imageUrl) {
    throw new Error('Upload ImgBB échoué');
  }

  return imageUrl;
}
