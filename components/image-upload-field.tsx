"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { resolveApiMediaUrl, toUploadStoragePath } from "@/lib/media-url";
import { listMedia, uploadImageFile, type MediaItem } from "@/lib/upload";

const inputClass =
  "mt-1 w-full rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm outline-none focus:border-mauve";

type Props = { label?: string; value: string; onChange: (url: string) => void };

export function ImageUploadField({ label = "Image", value, onChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [media, setMedia] = useState<MediaItem[]>([]);

  const previewSrc = value ? resolveApiMediaUrl(value) : "";

  const loadMedia = useCallback(async () => {
    try {
      setMedia(await listMedia());
    } catch {
      setMedia([]);
    }
  }, []);

  useEffect(() => {
    if (libraryOpen) void loadMedia();
  }, [libraryOpen, loadMedia]);

  async function handleFile(file: File) {
    setError("");
    setUploading(true);
    try {
      onChange(await uploadImageFile(file));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-3">
      <label className="text-xs font-semibold uppercase text-muted">{label}</label>
      {value ? (
        <div className="relative overflow-hidden rounded-xl border border-rose-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewSrc} alt="Preview" className="max-h-48 w-full object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-2 top-2 rounded-md bg-white/90 px-2 py-1 text-xs"
          >
            Remove
          </button>
        </div>
      ) : null}
      <input
        className={inputClass}
        value={value}
        onChange={(e) => onChange(toUploadStoragePath(e.target.value))}
        onBlur={(e) => onChange(toUploadStoragePath(e.target.value))}
        placeholder="/uploads/your-image.jpg"
      />
      <p className="text-[10px] text-muted">
        Stored as <code className="text-ink">/uploads/…</code> — preview uses your API URL from env (
        {process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") || "localhost:5000"}).
      </p>
      <div className="flex flex-wrap gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handleFile(f);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
          className="rounded-lg bg-mauve-deep px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
        >
          {uploading ? "Uploading…" : "Upload image"}
        </button>
        <button
          type="button"
          onClick={() => setLibraryOpen((o) => !o)}
          className="rounded-lg border border-rose-200 px-4 py-2 text-xs font-semibold"
        >
          Media library
        </button>
      </div>
      {error ? <p className="text-xs text-red-500">{error}</p> : null}
      {libraryOpen && media.length > 0 ? (
        <div className="grid grid-cols-4 gap-2">
          {media.map((m) => (
            <button
              key={m.filename}
              type="button"
              onClick={() => {
                onChange(m.path || toUploadStoragePath(m.url));
                setLibraryOpen(false);
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={resolveApiMediaUrl(m.path || m.url)} alt="" className="aspect-square w-full rounded-lg object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
