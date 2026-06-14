"use client";

import type { CookieConsentRecord } from "@/lib/cookie-consents-api";
import { deviceLabel, statusClass, statusLabel } from "@/lib/cookie-consents-api";

type Props = {
  record: CookieConsentRecord | null;
  onClose: () => void;
};

function PrefRow({ label, on }: { label: string; on: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-rose-50/60 px-3 py-2 text-sm">
      <span className="text-muted">{label}</span>
      <span className={`font-medium ${on ? "text-emerald-700" : "text-rose-600"}`}>{on ? "On" : "Off"}</span>
    </div>
  );
}

export function VisitorDetailsModal({ record, onClose }: Props) {
  if (!record) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/45 p-4 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-rose-100 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-start justify-between gap-4 border-b border-rose-100 bg-gradient-to-r from-rose-50 to-white px-5 py-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Visitor details</p>
            <h2 className="mt-1 font-serif text-2xl text-ink">{record.visitorId.slice(0, 12)}…</h2>
            <span
              className={`mt-2 inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${statusClass(record.status)}`}
            >
              {statusLabel(record.status)}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-sm text-muted hover:bg-rose-50 hover:text-ink"
          >
            Close
          </button>
        </div>

        <div className="space-y-6 p-5">
          <section>
            <h3 className="text-sm font-semibold text-ink">Overview</h3>
            <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
              {[
                ["Date & time", new Date(record.updatedAt).toLocaleString("en-IN")],
                ["Policy version", record.policyVersion || "—"],
                ["Page URL", record.pageUrl || "—"],
                ["IP address", record.ipAddress || "—"],
                ["Country", record.country || "—"],
                ["Browser", record.browser || "—"],
                ["Device", deviceLabel(record.deviceType)],
                ["Referrer", record.referrer || "—"],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl border border-rose-50 bg-cream/50 px-3 py-2.5">
                  <dt className="text-xs text-muted">{k}</dt>
                  <dd className="mt-0.5 break-all font-medium text-ink">{v}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-ink">Consent categories</h3>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <PrefRow label="Necessary" on={record.preferences.necessary} />
              <PrefRow label="Analytics" on={record.preferences.analytics} />
              <PrefRow label="Marketing" on={record.preferences.marketing} />
              <PrefRow label="Functional" on={record.preferences.functional} />
            </div>
          </section>

          {record.pagesBeforeConsent?.length ? (
            <section>
              <h3 className="text-sm font-semibold text-ink">Pages visited before consent</h3>
              <ul className="mt-3 space-y-2">
                {record.pagesBeforeConsent.map((p, i) => (
                  <li key={i} className="rounded-lg border border-rose-50 px-3 py-2 text-sm">
                    <p className="font-medium text-ink">{p.url}</p>
                    <p className="text-xs text-muted">{new Date(p.visitedAt).toLocaleString("en-IN")}</p>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section>
            <h3 className="text-sm font-semibold text-ink">Consent history</h3>
            {(record.history?.length ? record.history : []).slice().reverse().length ? (
              <ul className="mt-3 space-y-2">
                {[...(record.history || [])].reverse().map((h, i) => (
                  <li key={h._id || i} className="rounded-lg border border-rose-50 px-3 py-2.5 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs ring-1 ring-inset ${statusClass(h.status)}`}>
                        {statusLabel(h.status)}
                      </span>
                      <span className="text-xs text-muted">{new Date(h.at).toLocaleString("en-IN")}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted">Policy v{h.policyVersion} · {h.pageUrl || "—"}</p>
                    <p className="mt-1 text-xs text-muted">
                      Analytics {h.preferences.analytics ? "on" : "off"} · Marketing{" "}
                      {h.preferences.marketing ? "on" : "off"} · Functional {h.preferences.functional ? "on" : "off"}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-muted">No history entries.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
