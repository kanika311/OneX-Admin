"use client";

import { useCallback, useEffect, useState } from "react";

import { apiFetch } from "@/lib/api";
import { resolveApiMediaUrl } from "@/lib/media-url";

type Testimonial = {
  _id: string;
  fullName: string;
  email: string;
  photo: string;
  serviceUsed: string;
  rating: number;
  message: string;
  serviceDate: string;
  status: "pending" | "approved" | "rejected";
  featured: boolean;
  createdAt: string;
};

const STATUS_TABS = ["pending", "approved", "rejected", "all"] as const;

export default function TestimonialsPage() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [status, setStatus] = useState<(typeof STATUS_TABS)[number]>("pending");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<{ testimonials: Testimonial[] }>(
        `/testimonials?status=${status}&limit=200`,
      );
      setItems(data.testimonials);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    void load();
  }, [load]);

  async function patch(id: string, body: { status?: string; featured?: boolean }) {
    setBusyId(id);
    setError("");
    try {
      const data = await apiFetch<{ testimonial: Testimonial }>(`/testimonials/${id}`, {
        method: "PATCH",
        body,
      });
      setItems((prev) => {
        if (status !== "all" && body.status && body.status !== status) {
          return prev.filter((t) => t._id !== id);
        }
        return prev.map((t) => (t._id === id ? data.testimonial : t));
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id: string) {
    const ok = window.confirm("Delete this testimonial permanently?");
    if (!ok) return;
    setBusyId(id);
    setError("");
    try {
      await apiFetch(`/testimonials/${id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((t) => t._id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-ink">Testimonials</h1>
          <p className="mt-2 text-sm text-muted">
            Review client submissions. Approve to show on the public site and service pages.
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setStatus(tab)}
            className={`rounded-lg px-4 py-2 text-sm font-medium capitalize ${
              status === tab
                ? "bg-rose-50 text-mauve-deep"
                : "text-muted hover:bg-rose-50/60 hover:text-ink"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {error ? <p className="mt-4 text-sm text-red-500">{error}</p> : null}

      {loading ? (
        <p className="mt-10 text-muted">Loading…</p>
      ) : items.length === 0 ? (
        <p className="mt-10 rounded-xl border border-rose-100 bg-white p-8 text-center text-muted">
          No {status === "all" ? "" : status} testimonials.
        </p>
      ) : (
        <div className="mt-8 space-y-4">
          {items.map((t) => (
            <article
              key={t._id}
              className="rounded-xl border border-rose-100 bg-white p-5 shadow-sm sm:p-6"
            >
              <div className="flex flex-wrap items-start gap-4">
                {t.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={resolveApiMediaUrl(t.photo)}
                    alt={t.fullName}
                    className="size-14 shrink-0 rounded-full border border-rose-100 object-cover"
                  />
                ) : (
                  <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-rose-50 text-lg font-semibold text-mauve-deep">
                    {t.fullName.charAt(0)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-medium text-ink">{t.fullName}</h2>
                    <span className="text-xs text-muted">{"★".repeat(t.rating)}</span>
                    {t.featured ? (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase text-amber-800">
                        Featured
                      </span>
                    ) : null}
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                        t.status === "approved"
                          ? "bg-emerald-50 text-emerald-700"
                          : t.status === "rejected"
                            ? "bg-red-50 text-red-600"
                            : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    {t.serviceUsed} · {t.email} ·{" "}
                    {t.serviceDate ? new Date(t.serviceDate).toLocaleDateString("en-IN") : "—"}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-ink">&ldquo;{t.message}&rdquo;</p>
                  <p className="mt-2 text-xs text-subtle">
                    Submitted {new Date(t.createdAt).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-3 border-t border-rose-50 pt-4 text-sm">
                {t.status !== "approved" ? (
                  <button
                    type="button"
                    disabled={busyId === t._id}
                    onClick={() => void patch(t._id, { status: "approved" })}
                    className="text-emerald-700 hover:underline disabled:opacity-50"
                  >
                    Approve
                  </button>
                ) : null}
                {t.status !== "rejected" ? (
                  <button
                    type="button"
                    disabled={busyId === t._id}
                    onClick={() => void patch(t._id, { status: "rejected" })}
                    className="text-amber-700 hover:underline disabled:opacity-50"
                  >
                    Reject
                  </button>
                ) : null}
                {t.status === "approved" ? (
                  <button
                    type="button"
                    disabled={busyId === t._id}
                    onClick={() => void patch(t._id, { featured: !t.featured })}
                    className="text-mauve-deep hover:underline disabled:opacity-50"
                  >
                    {t.featured ? "Unfeature" : "Feature"}
                  </button>
                ) : null}
                <button
                  type="button"
                  disabled={busyId === t._id}
                  onClick={() => void remove(t._id)}
                  className="text-red-600 hover:underline disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
