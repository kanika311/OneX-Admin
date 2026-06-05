"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { apiFetch } from "@/lib/api";

type Stats = {
  products: number;
  activeProducts: number;
  offers: number;
  users: number;
  orders: number;
  pendingOrders: number;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    apiFetch<{ stats: Stats }>("/admin/stats")
      .then((d) => setStats(d.stats))
      .catch(() => setStats(null));
  }, []);

  return (
    <div>
      <h1 className="font-serif text-3xl text-ink">Dashboard</h1>
      <p className="mt-2 text-muted">Overview of your 1X store</p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Products", value: stats?.products ?? "—", hint: "in catalog" },
          { label: "Offers", value: stats?.offers ?? "—", hint: "" },
          { label: "Registered users", value: stats?.users ?? "—", hint: "site sign-ups" },
          { label: "Orders", value: stats?.orders ?? 0, hint: "after checkout" },
          { label: "Pending orders", value: stats?.pendingOrders ?? 0, hint: "" },
        ].map((c) => (
          <div key={c.label} className="rounded-xl border border-rose-100 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase text-muted">{c.label}</p>
            <p className="mt-2 font-serif text-3xl text-ink">{c.value}</p>
            {c.hint ? <p className="mt-1 text-xs text-muted">{c.hint}</p> : null}
          </div>
        ))}
      </div>
      <div className="mt-12 flex flex-wrap gap-3">
        <Link href="/dashboard/products/new" className="rounded-lg bg-mauve-deep px-5 py-2.5 text-sm font-semibold text-white">
          + Add product
        </Link>
        <Link href="/dashboard/offers/new" className="rounded-lg border border-rose-200 bg-white px-5 py-2.5 text-sm font-semibold">
          + Add offer
        </Link>
        <Link href="/dashboard/orders" className="rounded-lg border border-rose-200 bg-white px-5 py-2.5 text-sm font-semibold">
          View orders
        </Link>
      </div>
      {!stats ? (
        <p className="mt-8 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Start API first: <code className="text-xs">cd onex-api &amp;&amp; npm run dev</code>
        </p>
      ) : null}
    </div>
  );
}
