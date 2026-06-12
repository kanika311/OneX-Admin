"use client";

import { useCallback, useEffect, useState } from "react";

import { apiFetch } from "@/lib/api";

type Subscriber = {
  _id: string;
  email: string;
  source: string;
  createdAt: string;
};

export default function NewsletterPage() {
  const [items, setItems] = useState<Subscriber[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<{ subscribers: Subscriber[]; total: number }>(
        "/newsletter?limit=500",
      );
      setItems(data.subscribers);
      setTotal(data.total);
    } catch {
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function remove(id: string) {
    const ok = window.confirm("Remove this email from the newsletter list?");
    if (!ok) return;
    setBusyId(id);
    setError("");
    try {
      await apiFetch(`/newsletter/${id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((s) => s._id !== id));
      setTotal((t) => Math.max(0, t - 1));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <h1 className="font-serif text-3xl text-ink">footer-signup</h1>
      <p className="mt-2 text-sm text-muted">
        Emails submitted from the footer &ldquo;sign up for updates&rdquo; form.
      </p>
      <p className="mt-1 text-sm font-medium text-ink">{total} subscriber{total === 1 ? "" : "s"}</p>

      {error ? <p className="mt-4 text-sm text-red-500">{error}</p> : null}

      {loading ? (
        <p className="mt-10 text-muted">Loading…</p>
      ) : items.length === 0 ? (
        <p className="mt-10 rounded-xl border border-rose-100 bg-white p-8 text-center text-muted">
          No signups yet.
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-xl border border-rose-100 bg-white">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="border-b bg-rose-50/50 text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Signed up</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((s) => (
                <tr key={s._id} className="border-b border-rose-50">
                  <td className="px-4 py-3">
                    <a href={`mailto:${s.email}`} className="font-medium text-ink hover:text-mauve-deep hover:underline">
                      {s.email}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {new Date(s.createdAt).toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      disabled={busyId === s._id}
                      onClick={() => void remove(s._id)}
                      className="text-red-600 hover:underline disabled:opacity-50"
                    >
                      {busyId === s._id ? "Removing…" : "Remove"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
