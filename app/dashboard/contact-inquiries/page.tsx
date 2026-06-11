"use client";

import { useCallback, useEffect, useState } from "react";

import { apiFetch } from "@/lib/api";
import { openGmailReply, openMailtoReply } from "@/lib/reply-email";

type ContactInquiry = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: "new" | "read" | "replied" | "archived";
  createdAt: string;
};

const STATUS_TABS = ["new", "read", "replied", "archived", "all"] as const;

const STATUS_LABEL: Record<ContactInquiry["status"], string> = {
  new: "New",
  read: "Read",
  replied: "Replied",
  archived: "Archived",
};

export default function ContactInquiriesPage() {
  const [items, setItems] = useState<ContactInquiry[]>([]);
  const [status, setStatus] = useState<(typeof STATUS_TABS)[number]>("new");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<{ inquiries: ContactInquiry[] }>(
        `/contact-inquiries?status=${status}&limit=200`,
      );
      setItems(data.inquiries);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    void load();
  }, [load]);

  async function patch(id: string, body: { status: ContactInquiry["status"] }) {
    setBusyId(id);
    setError("");
    try {
      const data = await apiFetch<{ inquiry: ContactInquiry }>(`/contact-inquiries/${id}`, {
        method: "PATCH",
        body,
      });
      setItems((prev) => {
        if (status !== "all" && body.status !== status) {
          return prev.filter((t) => t._id !== id);
        }
        return prev.map((t) => (t._id === id ? data.inquiry : t));
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setBusyId(null);
    }
  }

  async function replyByEmail(item: ContactInquiry) {
    openGmailReply({ email: item.email, name: item.name, message: item.message });
    if (item.status === "new") {
      await patch(item._id, { status: "read" });
    }
  }

  async function remove(id: string) {
    const ok = window.confirm("Delete this message permanently?");
    if (!ok) return;
    setBusyId(id);
    setError("");
    try {
      await apiFetch(`/contact-inquiries/${id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((t) => t._id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div>
        <h1 className="font-serif text-3xl text-ink">Contact messages</h1>
        <p className="mt-2 text-sm text-muted">
          Messages submitted from the public Contact page.
        </p>
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
          No {status === "all" ? "" : status} messages.
        </p>
      ) : (
        <div className="mt-8 space-y-4">
          {items.map((item) => (
            <article
              key={item._id}
              className="rounded-xl border border-rose-100 bg-white p-5 shadow-sm sm:p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-medium text-ink">{item.name}</h2>
                  <p className="mt-1 text-sm text-muted">
                    <a href={`mailto:${item.email}`} className="hover:text-ink hover:underline">
                      {item.email}
                    </a>
                    {item.phone ? (
                      <>
                        {" "}
                        ·{" "}
                        <a href={`tel:${item.phone}`} className="hover:text-ink hover:underline">
                          {item.phone}
                        </a>
                      </>
                    ) : null}
                  </p>
                  <p className="mt-1 text-xs text-subtle">
                    {new Date(item.createdAt).toLocaleString("en-IN")}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase ${
                    item.status === "new"
                      ? "bg-amber-50 text-amber-700"
                      : item.status === "replied"
                        ? "bg-emerald-50 text-emerald-700"
                        : item.status === "archived"
                          ? "bg-slate-100 text-slate-600"
                          : "bg-rose-50 text-mauve-deep"
                  }`}
                >
                  {STATUS_LABEL[item.status]}
                </span>
              </div>

              <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-ink">{item.message}</p>

              <div className="mt-4 flex flex-wrap gap-3 border-t border-rose-50 pt-4 text-sm">
                {item.status === "new" ? (
                  <button
                    type="button"
                    disabled={busyId === item._id}
                    onClick={() => void patch(item._id, { status: "read" })}
                    className="text-mauve-deep hover:underline disabled:opacity-50"
                  >
                    Mark read
                  </button>
                ) : null}
                {item.status !== "replied" ? (
                  <button
                    type="button"
                    disabled={busyId === item._id}
                    onClick={() => void patch(item._id, { status: "replied" })}
                    className="text-emerald-700 hover:underline disabled:opacity-50"
                  >
                    Mark replied
                  </button>
                ) : null}
                {item.status !== "archived" ? (
                  <button
                    type="button"
                    disabled={busyId === item._id}
                    onClick={() => void patch(item._id, { status: "archived" })}
                    className="text-muted hover:text-ink hover:underline disabled:opacity-50"
                  >
                    Archive
                  </button>
                ) : null}
                <button
                  type="button"
                  disabled={busyId === item._id}
                  onClick={() => void replyByEmail(item)}
                  className="text-mauve-deep hover:underline disabled:opacity-50"
                >
                  Reply by email
                </button>
                {/* <button
                  type="button"
                  onClick={() =>
                    openMailtoReply({ email: item.email, name: item.name, message: item.message })
                  }
                  className="text-muted hover:text-ink hover:underline"
                >
                  Default mail app
                </button> */}
                <button
                  type="button"
                  disabled={busyId === item._id}
                  onClick={() => void remove(item._id)}
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
