"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { apiFetch, type Order } from "@/lib/api";

const STATUS_STYLES: Record<Order["status"], string> = {
  pending: "bg-amber-100 text-amber-900",
  confirmed: "bg-emerald-100 text-emerald-900",
  cancelled: "bg-rose-100 text-rose-800",
};

const PAYMENT_STYLES: Record<NonNullable<Order["paymentStatus"]>, string> = {
  awaiting: "bg-slate-100 text-slate-700",
  submitted: "bg-sky-100 text-sky-900",
  confirmed: "bg-emerald-100 text-emerald-900",
};

function paymentLabel(status?: Order["paymentStatus"]) {
  if (status === "submitted") return "Payment received";
  if (status === "confirmed") return "Paid";
  return "Awaiting payment";
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<p className="mt-10 text-muted">Loading…</p>}>
      <OrdersPageContent />
    </Suspense>
  );
}

function OrdersPageContent() {
  const searchParams = useSearchParams();
  const emailFilter = searchParams.get("email") ?? "";
  const phoneFilter = searchParams.get("phone") ?? "";
  const userIdFilter = searchParams.get("userId") ?? "";
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const filterLabel = userIdFilter
    ? "this registered user"
    : phoneFilter
      ? phoneFilter
      : emailFilter
        ? emailFilter
        : null;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (userIdFilter) params.set("userId", userIdFilter);
      if (phoneFilter) params.set("phone", phoneFilter);
      if (emailFilter) params.set("email", emailFilter);
      const q = params.toString() ? `?${params.toString()}` : "";
      const data = await apiFetch<{ orders: Order[] }>(`/admin/orders${q}`);
      setOrders(data.orders);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [emailFilter, phoneFilter, userIdFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const hasFilter = Boolean(filterLabel);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-ink">Orders</h1>
          <p className="mt-2 text-sm text-muted">
            {hasFilter ? `Orders for ${filterLabel}` : "All orders placed from the site cart checkout."}
          </p>
        </div>
        {hasFilter ? (
          <Link href="/dashboard/orders" className="text-sm font-medium text-mauve-deep hover:underline">
            Clear filter
          </Link>
        ) : null}
      </div>

      {loading ? (
        <p className="mt-10 text-muted">Loading…</p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-xl border border-rose-100 bg-white">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="border-b bg-rose-50/50 text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const phone = o.customerPhone || o.user?.number || "";
                return (
                  <tr key={o._id} className="border-b border-rose-50">
                    <td className="px-4 py-3 text-muted">{new Date(o.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{o.customerName}</p>
                      <p className="text-xs text-muted">{phone || "—"}</p>
                    </td>
                    <td className="px-4 py-3">{o.itemCount}</td>
                    <td className="px-4 py-3 font-medium">₹{o.subtotal.toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLES[o.status]}`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${PAYMENT_STYLES[o.paymentStatus ?? "awaiting"]}`}
                      >
                        {paymentLabel(o.paymentStatus)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/dashboard/orders/${o._id}`} className="text-mauve-deep hover:underline">
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {orders.length === 0 ? <p className="p-8 text-center text-muted">No orders yet.</p> : null}
        </div>
      )}
    </div>
  );
}
