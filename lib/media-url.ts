/** API origin without /api — from admin .env */
export function getApiOrigin(): string {
  return (
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/i, "") ||
    process.env.NEXT_PUBLIC_API_ORIGIN?.replace(/\/$/, "") ||
    "http://localhost:5000"
  );
}

/** Save only /uploads/filename in MongoDB (never localhost). */
export function toUploadStoragePath(url: string | undefined | null): string {
  if (!url) return "";
  const trimmed = url.trim();
  const match = trimmed.match(/\/uploads\/([^?#]+)/i);
  if (match) return `/uploads/${match[1]}`;
  return trimmed;
}

/** Preview & display — uses NEXT_PUBLIC_API_URL from admin env. */
export function resolveApiMediaUrl(url: string | undefined | null): string {
  if (!url) return "";

  const trimmed = url.trim();
  const apiRoot = getApiOrigin();
  const match = trimmed.match(/\/uploads\/([^?#]+)/i);

  if (match) {
    return `${apiRoot}/uploads/${match[1]}`;
  }

  return trimmed;
}
