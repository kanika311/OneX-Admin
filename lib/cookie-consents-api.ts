import { apiFetch } from "@/lib/api";

export type ConsentStatus = "accepted" | "rejected" | "customized";

export type CookiePreferences = {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
};

export type PageVisit = { url: string; visitedAt: string };
export type HistoryEntry = {
  _id?: string;
  status: ConsentStatus;
  preferences: CookiePreferences;
  policyVersion: string;
  pageUrl: string;
  at: string;
};

export type CookieConsentRecord = {
  _id: string;
  visitorId: string;
  status: ConsentStatus;
  pageUrl: string;
  referrer: string;
  userAgent: string;
  ipAddress: string;
  deviceType: "mobile" | "desktop" | "tablet" | "unknown";
  browser: string;
  country: string;
  policyVersion: string;
  preferences: CookiePreferences;
  pagesBeforeConsent: PageVisit[];
  history: HistoryEntry[];
  createdAt: string;
  updatedAt: string;
};

export type CookiePolicySettings = {
  currentVersion: string;
  categories: CookiePreferences;
  versionHistory: { _id?: string; version: string; note: string; publishedAt: string }[];
};

export type CookieStats = {
  totalVisitors: number;
  accepted: number;
  rejected: number;
  customized: number;
  acceptanceRate: number;
  consentChanges: number;
  dailyTrend: { _id: string; accepted: number; rejected: number; customized: number; total: number }[];
  devices: { device: string; count: number }[];
  versionBreakdown: { version: string; count: number }[];
};

export type ConsentFilters = {
  search?: string;
  status?: string;
  deviceType?: string;
  country?: string;
  pageUrl?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
};

function toQuery(filters: ConsentFilters) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== "" && v !== "all") params.set(k, String(v));
  });
  const q = params.toString();
  return q ? `?${q}` : "";
}

export async function fetchCookieStats(filters: ConsentFilters = {}) {
  return apiFetch<{ stats: CookieStats; policy: CookiePolicySettings }>(`/cookie-consents/stats${toQuery(filters)}`);
}

export async function fetchCookieConsents(filters: ConsentFilters = {}) {
  return apiFetch<{ consents: CookieConsentRecord[]; total: number }>(`/cookie-consents${toQuery(filters)}`);
}

export async function fetchCookieConsent(id: string) {
  return apiFetch<{ consent: CookieConsentRecord }>(`/cookie-consents/${id}`);
}

export async function deleteCookieConsent(id: string) {
  return apiFetch(`/cookie-consents/${id}`, { method: "DELETE" });
}

export async function fetchCookieCountries() {
  return apiFetch<{ countries: string[] }>("/cookie-consents/countries");
}

export async function updateCookiePolicy(body: {
  currentVersion?: string;
  versionNote?: string;
  categories?: Partial<CookiePreferences>;
}) {
  return apiFetch<{ policy: CookiePolicySettings }>("/cookie-consents/policy", {
    method: "PUT",
    body,
  });
}

export function statusLabel(status: ConsentStatus | undefined) {
  const s = status || "accepted";
  if (s === "accepted") return "Accepted";
  if (s === "rejected") return "Rejected";
  return "Customized";
}

export function statusClass(status: ConsentStatus | undefined) {
  const s = status || "accepted";
  if (s === "accepted") return "bg-emerald-50 text-emerald-700 ring-emerald-100";
  if (s === "rejected") return "bg-rose-50 text-rose-700 ring-rose-100";
  return "bg-amber-50 text-amber-800 ring-amber-100";
}

export function deviceLabel(device: string) {
  if (device === "mobile") return "Mobile";
  if (device === "desktop") return "Desktop";
  if (device === "tablet") return "Tablet";
  return "Unknown";
}
