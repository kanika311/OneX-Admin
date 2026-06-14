"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { AnalyticsCharts, SummaryCards } from "@/components/cookie-consents/charts";
import { downloadCsv, downloadExcel, printConsentReport } from "@/components/cookie-consents/export-utils";
import { PolicySection } from "@/components/cookie-consents/policy-section";
import { VisitorDetailsModal } from "@/components/cookie-consents/visitor-modal";
import {
  deleteCookieConsent,
  deviceLabel,
  fetchCookieConsent,
  fetchCookieConsents,
  fetchCookieCountries,
  fetchCookieStats,
  statusClass,
  statusLabel,
  type ConsentFilters,
  type CookieConsentRecord,
  type CookiePolicySettings,
  type CookieStats,
} from "@/lib/cookie-consents-api";

const STATUS_OPTIONS = ["all", "accepted", "rejected", "customized"] as const;
const DEVICE_OPTIONS = ["all", "mobile", "desktop", "tablet", "unknown"] as const;

export default function CookieConsentsPage() {
  const [stats, setStats] = useState<CookieStats | null>(null);
  const [policy, setPolicy] = useState<CookiePolicySettings | null>(null);
  const [items, setItems] = useState<CookieConsentRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [countries, setCountries] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<CookieConsentRecord | null>(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [deviceType, setDeviceType] = useState<string>("all");
  const [country, setCountry] = useState<string>("all");
  const [pageUrl, setPageUrl] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filters: ConsentFilters = useMemo(
    () => ({
      search: search.trim() || undefined,
      status: status !== "all" ? status : undefined,
      deviceType: deviceType !== "all" ? deviceType : undefined,
      country: country !== "all" ? country : undefined,
      pageUrl: pageUrl.trim() || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      limit: 500,
    }),
    [search, status, deviceType, country, pageUrl, dateFrom, dateTo],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [statsRes, listRes] = await Promise.all([
        fetchCookieStats(filters),
        fetchCookieConsents(filters),
      ]);
      setStats(statsRes.stats);
      setPolicy(statsRes.policy);
      setItems(listRes.consents);
      setTotal(listRes.total);
    } catch (e) {
      setStats(null);
      setItems([]);
      setTotal(0);
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    void fetchCookieCountries()
      .then((d) => setCountries(d.countries))
      .catch(() => setCountries([]));
  }, []);

  async function viewRecord(id: string) {
    try {
      const data = await fetchCookieConsent(id);
      setSelected(data.consent);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load visitor");
    }
  }

  async function remove(id: string) {
    const ok = window.confirm("Delete this consent record permanently?");
    if (!ok) return;
    setBusyId(id);
    setError("");
    try {
      await deleteCookieConsent(id);
      setItems((prev) => prev.filter((c) => c._id !== id));
      setTotal((t) => Math.max(0, t - 1));
      if (selected?._id === id) setSelected(null);
      void load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBusyId(null);
    }
  }

  const statsSummary = stats
    ? `${stats.totalVisitors} visitors · ${stats.accepted} accepted · ${stats.rejected} rejected · ${stats.customized} customized · ${stats.acceptanceRate}% acceptance rate`
    : "";

  function clearFilters() {
    setSearch("");
    setStatus("all");
    setDeviceType("all");
    setCountry("all");
    setPageUrl("");
    setDateFrom("");
    setDateTo("");
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-ink">Cookie consent management</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            GDPR-ready analytics for visitor cookie choices — acceptance rates, device breakdown, policy versions,
            and exportable records for healthcare compliance.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => downloadCsv(items)}
            className="rounded-lg border border-rose-200 bg-white px-4 py-2 text-sm font-medium hover:bg-rose-50"
          >
            Export CSV
          </button>
          <button
            type="button"
            onClick={() => downloadExcel(items)}
            className="rounded-lg border border-rose-200 bg-white px-4 py-2 text-sm font-medium hover:bg-rose-50"
          >
            Export Excel
          </button>
          <button
            type="button"
            onClick={() => printConsentReport(items, statsSummary)}
            className="rounded-lg bg-mauve-deep px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            Print report
          </button>
        </div>
      </div>

      <SummaryCards stats={stats} />
      <AnalyticsCharts stats={stats} />

      <PolicySection
        policy={policy}
        versionBreakdown={stats?.versionBreakdown ?? []}
        onUpdated={(p) => {
          setPolicy(p);
          void load();
        }}
      />

      <div className="rounded-2xl border border-rose-100 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-medium text-ink">Consent records</h2>
          <p className="text-sm text-muted">
            {total} record{total === 1 ? "" : "s"}
            {loading ? " · Loading…" : ""}
          </p>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <input
            type="search"
            placeholder="Search IP, page URL, visitor ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg border border-rose-100 px-3 py-2 text-sm md:col-span-2 xl:col-span-1"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-lg border border-rose-100 px-3 py-2 text-sm"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o} value={o}>
                Status: {o}
              </option>
            ))}
          </select>
          <select
            value={deviceType}
            onChange={(e) => setDeviceType(e.target.value)}
            className="rounded-lg border border-rose-100 px-3 py-2 text-sm"
          >
            {DEVICE_OPTIONS.map((o) => (
              <option key={o} value={o}>
                Device: {o}
              </option>
            ))}
          </select>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="rounded-lg border border-rose-100 px-3 py-2 text-sm"
          >
            <option value="all">Country: all</option>
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Filter by page URL"
            value={pageUrl}
            onChange={(e) => setPageUrl(e.target.value)}
            className="rounded-lg border border-rose-100 px-3 py-2 text-sm"
          />
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="rounded-lg border border-rose-100 px-3 py-2 text-sm"
            aria-label="Date from"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="rounded-lg border border-rose-100 px-3 py-2 text-sm"
            aria-label="Date to"
          />
          <button
            type="button"
            onClick={clearFilters}
            className="rounded-lg border border-rose-100 px-3 py-2 text-sm text-muted hover:bg-rose-50"
          >
            Clear filters
          </button>
        </div>

        {error ? <p className="mt-4 text-sm text-red-500">{error}</p> : null}

        {loading && items.length === 0 ? (
          <p className="mt-10 text-center text-muted">Loading consent records…</p>
        ) : items.length === 0 ? (
          <p className="mt-10 rounded-xl border border-dashed border-rose-100 bg-rose-50/30 p-10 text-center text-muted">
            No consent records match your filters.
          </p>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-xl border border-rose-50">
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead className="border-b border-rose-100 bg-rose-50/60 text-[11px] uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3">Visitor ID</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date & time</th>
                  <th className="px-4 py-3">Page URL</th>
                  <th className="px-4 py-3">IP</th>
                  <th className="px-4 py-3">Browser & device</th>
                  <th className="px-4 py-3">Country</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((c) => (
                  <tr key={c._id} className="border-b border-rose-50 align-top transition hover:bg-rose-50/30">
                    <td className="px-4 py-3">
                      <p className="font-mono text-xs text-ink" title={c.visitorId}>
                        {c.visitorId.slice(0, 10)}…
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${statusClass(c.status)}`}
                      >
                        {statusLabel(c.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-muted">
                      {new Date(c.updatedAt).toLocaleString("en-IN")}
                    </td>
                    <td className="max-w-[160px] px-4 py-3">
                      <p className="truncate font-medium text-ink" title={c.pageUrl}>
                        {c.pageUrl || "—"}
                      </p>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted">{c.ipAddress || "—"}</td>
                    <td className="px-4 py-3">
                      <p className="text-ink">{c.browser || "—"}</p>
                      <p className="text-xs text-muted">{deviceLabel(c.deviceType)}</p>
                    </td>
                    <td className="px-4 py-3 text-muted">{c.country || "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => void viewRecord(c._id)}
                          className="font-medium text-mauve-deep hover:underline"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          disabled={busyId === c._id}
                          onClick={() => void remove(c._id)}
                          className="text-red-600 hover:underline disabled:opacity-50"
                        >
                          {busyId === c._id ? "…" : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <VisitorDetailsModal record={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
