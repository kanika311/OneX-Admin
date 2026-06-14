"use client";

import { useEffect, useState } from "react";

import type { CookiePolicySettings, CookieStats } from "@/lib/cookie-consents-api";
import { updateCookiePolicy } from "@/lib/cookie-consents-api";

type Props = {
  policy: CookiePolicySettings | null;
  versionBreakdown: CookieStats["versionBreakdown"];
  onUpdated: (policy: CookiePolicySettings) => void;
};

export function PolicySection({ policy, versionBreakdown, onUpdated }: Props) {
  const [categories, setCategories] = useState(policy?.categories);
  const [version, setVersion] = useState(policy?.currentVersion ?? "1.0");
  const [versionNote, setVersionNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (policy) {
      setCategories(policy.categories);
      setVersion(policy.currentVersion);
    }
  }, [policy]);

  if (!policy || !categories) return null;

  async function save() {
    setSaving(true);
    setMessage("");
    try {
      const data = await updateCookiePolicy({
        currentVersion: version,
        versionNote: versionNote || undefined,
        categories,
      });
      onUpdated(data.policy);
      setVersionNote("");
      setMessage("Policy settings saved.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const toggles = [
    ["Necessary", "necessary", true],
    ["Analytics", "analytics", false],
    ["Marketing", "marketing", false],
    ["Functional", "functional", false],
  ] as const;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-2xl border border-rose-100 bg-white p-5 shadow-sm">
        <h3 className="font-medium text-ink">Consent preferences (defaults)</h3>
        <p className="mt-1 text-xs text-muted">Default category toggles shown on the public banner.</p>
        <div className="mt-4 space-y-3">
          {toggles.map(([label, key, locked]) => (
            <label
              key={key}
              className="flex items-center justify-between rounded-xl border border-rose-50 bg-rose-50/40 px-4 py-3"
            >
              <span className="text-sm font-medium text-ink">{label}</span>
              <input
                type="checkbox"
                checked={categories[key]}
                disabled={locked || saving}
                onChange={(e) => setCategories((c) => ({ ...c!, [key]: e.target.checked, necessary: true }))}
                className="size-4 accent-mauve-deep"
              />
            </label>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-rose-100 bg-white p-5 shadow-sm">
        <h3 className="font-medium text-ink">Policy version tracking</h3>
        <p className="mt-1 text-xs text-muted">Current version and acceptance counts per version.</p>
        <div className="mt-4 space-y-3">
          <label className="block text-sm">
            <span className="text-muted">Current policy version</span>
            <input
              type="text"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              className="mt-1 w-full rounded-lg border border-rose-100 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm">
            <span className="text-muted">Update note (optional)</span>
            <input
              type="text"
              value={versionNote}
              onChange={(e) => setVersionNote(e.target.value)}
              placeholder="e.g. Updated analytics disclosure"
              className="mt-1 w-full rounded-lg border border-rose-100 px-3 py-2 text-sm"
            />
          </label>
          <button
            type="button"
            disabled={saving}
            onClick={() => void save()}
            className="rounded-lg bg-mauve-deep px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save policy settings"}
          </button>
          {message ? <p className="text-xs text-muted">{message}</p> : null}
        </div>

        <div className="mt-6">
          <p className="text-xs font-semibold uppercase text-muted">Users by version</p>
          <ul className="mt-2 space-y-1 text-sm">
            {versionBreakdown.length ? (
              versionBreakdown.map((v) => (
                <li key={v.version} className="flex justify-between rounded-lg bg-cream px-3 py-2">
                  <span>v{v.version}</span>
                  <span className="font-medium">{v.count}</span>
                </li>
              ))
            ) : (
              <li className="text-muted">No data yet</li>
            )}
          </ul>
        </div>

        <div className="mt-6">
          <p className="text-xs font-semibold uppercase text-muted">Version history</p>
          <ul className="mt-2 max-h-40 space-y-2 overflow-y-auto text-sm">
            {(policy.versionHistory || []).slice().reverse().map((h, i) => (
              <li key={h._id || i} className="rounded-lg border border-rose-50 px-3 py-2">
                <p className="font-medium text-ink">v{h.version}</p>
                <p className="text-xs text-muted">{h.note || "—"}</p>
                <p className="text-xs text-muted">{new Date(h.publishedAt).toLocaleDateString("en-IN")}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
