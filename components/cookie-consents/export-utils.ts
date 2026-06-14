import type { CookieConsentRecord } from "@/lib/cookie-consents-api";
import { deviceLabel, statusLabel } from "@/lib/cookie-consents-api";

function escapeCsv(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function rowToCells(r: CookieConsentRecord) {
  return [
    r.visitorId,
    statusLabel(r.status),
    new Date(r.updatedAt).toISOString(),
    r.pageUrl,
    r.ipAddress,
    `${r.browser} / ${deviceLabel(r.deviceType)}`,
    r.country || "—",
    r.policyVersion,
    r.preferences.analytics ? "yes" : "no",
    r.preferences.marketing ? "yes" : "no",
    r.preferences.functional ? "yes" : "no",
  ];
}

const HEADERS = [
  "Visitor ID",
  "Status",
  "Date & Time",
  "Page URL",
  "IP Address",
  "Browser & Device",
  "Country",
  "Policy Version",
  "Analytics",
  "Marketing",
  "Functional",
];

export function downloadCsv(records: CookieConsentRecord[], filename = "cookie-consents.csv") {
  const lines = [HEADERS.map(escapeCsv).join(",")];
  records.forEach((r) => lines.push(rowToCells(r).map((c) => escapeCsv(String(c))).join(",")));
  const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
  triggerDownload(blob, filename);
}

export function downloadExcel(records: CookieConsentRecord[], filename = "cookie-consents.xls") {
  const lines = [HEADERS.join("\t")];
  records.forEach((r) => lines.push(rowToCells(r).join("\t")));
  const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "application/vnd.ms-excel;charset=utf-8" });
  triggerDownload(blob, filename);
}

export function printConsentReport(records: CookieConsentRecord[], statsSummary: string) {
  const html = `<!DOCTYPE html>
<html><head><title>Cookie Consent Report</title>
<style>
  body { font-family: Inter, system-ui, sans-serif; color: #2a2438; padding: 32px; }
  h1 { font-size: 24px; margin-bottom: 8px; }
  p.meta { color: #6b6578; font-size: 14px; margin-bottom: 24px; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th, td { border: 1px solid #efd4dc; padding: 8px 10px; text-align: left; vertical-align: top; }
  th { background: #fdf5f6; text-transform: uppercase; letter-spacing: 0.04em; font-size: 10px; }
  tr:nth-child(even) td { background: #faf7f5; }
</style></head><body>
  <h1>Cookie Consent Report</h1>
  <p class="meta">${statsSummary}<br/>Generated ${new Date().toLocaleString()}</p>
  <table>
    <thead><tr>${HEADERS.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
    <tbody>
      ${records
        .map(
          (r) =>
            `<tr>${rowToCells(r)
              .map((c) => `<td>${String(c).replace(/</g, "&lt;")}</td>`)
              .join("")}</tr>`,
        )
        .join("")}
    </tbody>
  </table>
</body></html>`;
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.focus();
  w.print();
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
