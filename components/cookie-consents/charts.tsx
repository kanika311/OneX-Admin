"use client";

import type { CookieStats } from "@/lib/cookie-consents-api";

const CHART_H = 160;
const CHART_W = 320;

export function SummaryCards({ stats }: { stats: CookieStats | null }) {
  const cards = [
    { label: "Total Visitors", value: stats?.totalVisitors ?? "—", hint: "Unique consent records" },
    { label: "Accepted", value: stats?.accepted ?? "—", hint: "Full accept all" },
    { label: "Rejected", value: stats?.rejected ?? "—", hint: "Non-essential declined" },
    { label: "Acceptance Rate", value: stats ? `${stats.acceptanceRate}%` : "—", hint: "Accepted / total" },
    { label: "Consent Changes", value: stats?.consentChanges ?? "—", hint: "Preference updates" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((c) => (
        <div
          key={c.label}
          className="rounded-2xl border border-rose-100 bg-white p-5 shadow-sm transition hover:shadow-md"
        >
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">{c.label}</p>
          <p className="mt-2 font-serif text-3xl text-ink">{c.value}</p>
          <p className="mt-1 text-xs text-muted">{c.hint}</p>
        </div>
      ))}
    </div>
  );
}

function DailyTrendChart({ trend }: { trend: CookieStats["dailyTrend"] }) {
  const data = trend.slice(-14);
  const max = Math.max(1, ...data.map((d) => d.total));

  if (data.length === 0) {
    return <EmptyChart message="No daily data yet" />;
  }

  const barW = Math.max(12, (CHART_W - data.length * 6) / data.length);

  return (
    <div>
      <svg viewBox={`0 0 ${CHART_W} ${CHART_H + 24}`} className="w-full" aria-label="Daily acceptance trend">
        {data.map((d, i) => {
          const x = i * (barW + 6) + 4;
          const hAcc = (d.accepted / max) * CHART_H;
          const hRej = (d.rejected / max) * CHART_H;
          const hCust = (d.customized / max) * CHART_H;
          return (
            <g key={d._id}>
              <rect x={x} y={CHART_H - hAcc} width={barW} height={hAcc} rx={3} fill="#6d4a6f" opacity={0.85} />
              <rect
                x={x}
                y={CHART_H - hAcc - hCust}
                width={barW}
                height={hCust}
                rx={3}
                fill="#d4a574"
                opacity={0.9}
              />
              <rect
                x={x}
                y={CHART_H - hAcc - hCust - hRej}
                width={barW}
                height={hRej}
                rx={3}
                fill="#e8a4b8"
                opacity={0.95}
              />
              <text x={x + barW / 2} y={CHART_H + 16} textAnchor="middle" className="fill-muted text-[8px]">
                {d._id.slice(5)}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-mauve-deep" /> Accepted
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-amber-400" /> Customized
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-rose-300" /> Rejected
        </span>
      </div>
    </div>
  );
}

function PieChart({ stats }: { stats: CookieStats }) {
  const slices = [
    { label: "Accepted", value: stats.accepted, color: "#6d4a6f" },
    { label: "Rejected", value: stats.rejected, color: "#e8a4b8" },
    { label: "Customized", value: stats.customized, color: "#d4a574" },
  ].filter((s) => s.value > 0);

  const total = slices.reduce((s, x) => s + x.value, 0) || 1;
  let angle = -90;
  const cx = 80;
  const cy = 80;
  const r = 64;

  if (total === 0 || slices.length === 0) {
    return <EmptyChart message="No consent data" />;
  }

  const paths = slices.map((slice) => {
    const sweep = (slice.value / total) * 360;
    const start = (angle * Math.PI) / 180;
    angle += sweep;
    const end = (angle * Math.PI) / 180;
    const x1 = cx + r * Math.cos(start);
    const y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end);
    const y2 = cy + r * Math.sin(end);
    const large = sweep > 180 ? 1 : 0;
    const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
    return { ...slice, d, pct: Math.round((slice.value / total) * 100) };
  });

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
      <svg viewBox="0 0 160 160" className="size-36 shrink-0" aria-label="Accept vs reject">
        {paths.map((p) => (
          <path key={p.label} d={p.d} fill={p.color} stroke="#fff" strokeWidth={2} />
        ))}
        <circle cx={cx} cy={cy} r={28} fill="#fff" />
        <text x={cx} y={cy + 4} textAnchor="middle" className="fill-ink text-[11px] font-semibold">
          {total}
        </text>
      </svg>
      <ul className="space-y-2 text-sm">
        {paths.map((p) => (
          <li key={p.label} className="flex items-center justify-between gap-6">
            <span className="flex items-center gap-2 text-muted">
              <span className="size-2.5 rounded-full" style={{ background: p.color }} />
              {p.label}
            </span>
            <span className="font-medium text-ink">
              {p.value} ({p.pct}%)
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DeviceChart({ devices }: { devices: CookieStats["devices"] }) {
  const order = ["mobile", "desktop", "tablet", "unknown"];
  const sorted = order
    .map((d) => devices.find((x) => x.device === d) || { device: d, count: 0 })
    .filter((d) => d.count > 0);
  const max = Math.max(1, ...sorted.map((d) => d.count));

  if (sorted.length === 0) return <EmptyChart message="No device data" />;

  const labels: Record<string, string> = {
    mobile: "Mobile",
    desktop: "Desktop",
    tablet: "Tablet",
    unknown: "Unknown",
  };

  return (
    <div className="space-y-3">
      {sorted.map((d) => (
        <div key={d.device}>
          <div className="mb-1 flex justify-between text-xs">
            <span className="text-muted">{labels[d.device] || d.device}</span>
            <span className="font-medium text-ink">{d.count}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-rose-50">
            <div
              className="h-full rounded-full bg-gradient-to-r from-mauve to-mauve-deep transition-all"
              style={{ width: `${(d.count / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-rose-100 bg-rose-50/30 text-sm text-muted">
      {message}
    </div>
  );
}

export function AnalyticsCharts({ stats }: { stats: CookieStats | null }) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="rounded-2xl border border-rose-100 bg-white p-5 shadow-sm lg:col-span-1">
        <h3 className="font-medium text-ink">Daily acceptance trend</h3>
        <p className="mt-1 text-xs text-muted">Last 14 days with activity</p>
        <div className="mt-4">
          <DailyTrendChart trend={stats?.dailyTrend ?? []} />
        </div>
      </div>
      <div className="rounded-2xl border border-rose-100 bg-white p-5 shadow-sm">
        <h3 className="font-medium text-ink">Accept vs reject</h3>
        <p className="mt-1 text-xs text-muted">Distribution of consent choices</p>
        <div className="mt-4">{stats ? <PieChart stats={stats} /> : <EmptyChart message="Loading…" />}</div>
      </div>
      <div className="rounded-2xl border border-rose-100 bg-white p-5 shadow-sm">
        <h3 className="font-medium text-ink">Visitor devices</h3>
        <p className="mt-1 text-xs text-muted">Mobile, desktop, and tablet</p>
        <div className="mt-6">
          <DeviceChart devices={stats?.devices ?? []} />
        </div>
      </div>
    </div>
  );
}
