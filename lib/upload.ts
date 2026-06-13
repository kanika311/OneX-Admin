import { ApiError, getToken } from "@/lib/api";
import { toUploadStoragePath } from "@/lib/media-url";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export type MediaItem = { filename: string; url: string; path?: string; createdAt: string; size: number };

export async function uploadImageFile(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const token = getToken();
  const headers: HeadersInit = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API}/admin/upload`, { method: "POST", headers, body: form });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data.message || "Upload failed");

  return toUploadStoragePath(data.path || data.url);
}

export async function uploadVideoFile(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const token = getToken();
  const headers: HeadersInit = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API}/admin/upload-video`, { method: "POST", headers, body: form });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data.message || "Video upload failed");

  return toUploadStoragePath(data.path || data.url);
}

export async function listMedia(): Promise<MediaItem[]> {
  const token = getToken();
  const headers: HeadersInit = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API}/admin/media`, { headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data.message || "Could not load media");
  return (data.media as MediaItem[]).map((m) => ({
    ...m,
    path: toUploadStoragePath(m.path || m.url),
  }));
}
