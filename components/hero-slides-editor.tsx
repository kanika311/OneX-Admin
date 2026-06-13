"use client";

import { useState } from "react";

import { ImageUploadField } from "@/components/image-upload-field";
import { resolveApiMediaUrl } from "@/lib/media-url";
import { uploadVideoFile } from "@/lib/upload";

export type HeroSlide = {
  mediaType: "image" | "video";
  src: string;
  alt: string;
};

const inputClass =
  "mt-1 w-full rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm outline-none focus:border-mauve";

type Props = {
  slides: HeroSlide[];
  onChange: (slides: HeroSlide[]) => void;
};

export function HeroSlidesEditor({ slides, onChange }: Props) {
  const [uploadIndex, setUploadIndex] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  function updateSlide(index: number, patch: Partial<HeroSlide>) {
    onChange(slides.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  }

  function removeSlide(index: number) {
    onChange(slides.filter((_, i) => i !== index));
  }

  function moveSlide(index: number, dir: -1 | 1) {
    const next = index + dir;
    if (next < 0 || next >= slides.length) return;
    const copy = [...slides];
    [copy[index], copy[next]] = [copy[next], copy[index]];
    onChange(copy);
  }

  function addSlide() {
    onChange([...slides, { mediaType: "image", src: "", alt: "" }]);
  }

  async function handleVideoUpload(index: number, file: File) {
    setError("");
    setUploading(true);
    setUploadIndex(index);
    try {
      const path = await uploadVideoFile(file);
      updateSlide(index, { mediaType: "video", src: path });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Video upload failed");
    } finally {
      setUploading(false);
      setUploadIndex(null);
    }
  }

  return (
    <div className="space-y-4">
      {slides.map((slide, index) => {
        const preview = slide.src ? resolveApiMediaUrl(slide.src) : "";
        return (
          <div key={index} className="rounded-xl border border-rose-100 bg-rose-50/30 p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase text-muted">Slide {index + 1}</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => moveSlide(index, -1)}
                  disabled={index === 0}
                  className="rounded border border-rose-200 px-2 py-1 text-xs disabled:opacity-40"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => moveSlide(index, 1)}
                  disabled={index === slides.length - 1}
                  className="rounded border border-rose-200 px-2 py-1 text-xs disabled:opacity-40"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => removeSlide(index)}
                  className="rounded border border-red-200 px-2 py-1 text-xs text-red-600"
                >
                  Remove
                </button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-semibold uppercase text-muted">Type</label>
                <select
                  value={slide.mediaType}
                  onChange={(e) =>
                    updateSlide(index, {
                      mediaType: e.target.value as HeroSlide["mediaType"],
                      src: e.target.value === slide.mediaType ? slide.src : "",
                    })
                  }
                  className={inputClass}
                >
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-muted">Alt text</label>
                <input
                  value={slide.alt}
                  onChange={(e) => updateSlide(index, { alt: e.target.value })}
                  className={inputClass}
                  placeholder="Description for accessibility"
                />
              </div>
            </div>

            {slide.mediaType === "image" ? (
              <div className="mt-4">
                <ImageUploadField
                  label="Slide image"
                  value={slide.src}
                  onChange={(url) => updateSlide(index, { src: url, mediaType: "image" })}
                />
              </div>
            ) : (
              <div className="mt-4 space-y-2">
                <label className="text-xs font-semibold uppercase text-muted">Video file or URL</label>
                <input
                  value={slide.src}
                  onChange={(e) => updateSlide(index, { src: e.target.value })}
                  className={inputClass}
                  placeholder="/uploads/your-video.mp4"
                />
                <input
                  id={`hero-video-${index}`}
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void handleVideoUpload(index, f);
                    e.target.value = "";
                  }}
                />
                <label
                  htmlFor={`hero-video-${index}`}
                  className={`inline-block cursor-pointer rounded-lg bg-mauve-deep px-4 py-2 text-xs font-semibold text-white ${
                    uploading && uploadIndex === index ? "pointer-events-none opacity-60" : ""
                  }`}
                >
                  {uploading && uploadIndex === index ? "Uploading…" : "Upload video"}
                </label>
              </div>
            )}

            {preview ? (
              <div className="mt-4 overflow-hidden rounded-lg border border-rose-100">
                {slide.mediaType === "video" ? (
                  <video src={preview} controls className="max-h-40 w-full object-cover" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={preview} alt={slide.alt || "Preview"} className="max-h-40 w-full object-cover" />
                )}
              </div>
            ) : null}
          </div>
        );
      })}

      <button
        type="button"
        onClick={addSlide}
        className="w-full rounded-lg border border-dashed border-rose-200 py-3 text-sm font-semibold text-mauve-deep hover:bg-rose-50/50"
      >
        + Add slide
      </button>

      {error ? <p className="text-xs text-red-500">{error}</p> : null}
    </div>
  );
}
