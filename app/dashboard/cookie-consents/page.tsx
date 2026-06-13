"use client";

import { useCallback, useEffect, useState } from "react";

import { apiFetch } from "@/lib/api";

type CookieConsent = {
  _id: string;
  visitorId: string;
  pageUrl: string;
  referrer: string;
  userAgent: string;
  ipAddress: string;
  createdAt: string;
  updatedAt: string;
};

export default function CookieConsentsPage() {
  const [items, setItems] = useState<CookieConsent[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<{ consents: CookieConsent[]; total: number }>(
        "/cookie-consents?limit=500",
      );
      setItems(data.consents);
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
    const ok = window.confirm("Remove this cookie consent record?");
    if (!ok) return;
    setBusyId(id);
    setError("");
    try {
      await apiFetch(`/cookie-consents/${id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((c) => c._id !== id));
      setTotal((t) => Math.max(0, t - 1));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <h1 className="font-serif text-3xl text-ink">Cookie consents</h1>
      <p className="mt-2 text-sm text-muted">
        Visitors who clicked Accept on the cookie banner on the public site.
      </p>
      <p className="mt-1 text-sm font-medium text-ink">
        {total} acceptance{total === 1 ? "" : "s"}
      </p>

      {error ? <p className="mt-4 text-sm text-red-500">{error}</p> : null}

      {loading ? (
        <p className="mt-10 text-muted">Loading…</p>
      ) : items.length === 0 ? (
        <p className="mt-10 rounded-xl border border-rose-100 bg-white p-8 text-center text-muted">
          No cookie acceptances yet.
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-xl border border-rose-100 bg-white">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b bg-rose-50/50 text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3">Accepted</th>
                <th className="px-4 py-3">Page</th>
                <th className="px-4 py-3">Visitor</th>
                <th className="px-4 py-3">IP</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c._id} className="border-b border-rose-50 align-top">
                  <td className="px-4 py-3 text-muted">
                    {new Date(c.updatedAt).toLocaleString("en-IN")}
                  </td>
                  <td className="max-w-[180px] px-4 py-3">
                    <p className="truncate font-medium text-ink">{c.pageUrl || "—"}</p>
                    {c.referrer ? (
                      <p className="mt-1 truncate text-xs text-muted" title={c.referrer}>
                        from {c.referrer}
                      </p>
                    ) : null}
                  </td>
                  <td className="max-w-[200px] px-4 py-3">
                    <p className="truncate font-mono text-xs text-ink" title={c.visitorId}>
                      {c.visitorId.slice(0, 8)}…
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs text-muted" title={c.userAgent}>
                      {c.userAgent || "—"}
                    </p>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted">{c.ipAddress || "—"}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      disabled={busyId === c._id}
                      onClick={() => void remove(c._id)}
                      className="text-red-600 hover:underline disabled:opacity-50"
                    >
                      {busyId === c._id ? "Removing…" : "Remove"}
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
