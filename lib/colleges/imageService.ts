const STORAGE_BUCKET = "college-images";

export async function uploadCollegeImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/admin/colleges/upload-image", {
    method: "POST",
    body: formData,
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result?.error || "Image upload failed.");
  }

  return result.imageUrl as string;
}

export async function deleteCollegeImage(imageUrl: string, collegeId?: string) {
  const response = await fetch("/api/admin/colleges/images", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageUrl, collegeId }),
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result?.error || "Image deletion failed.");
  }

  return result;
}

export function getImageStoragePath(imageUrl: string) {
  try {
    const url = new URL(imageUrl);
    return decodeURIComponent(url.pathname.split(`/${STORAGE_BUCKET}/`).pop() ?? "");
  } catch {
    return imageUrl;
  }
}
