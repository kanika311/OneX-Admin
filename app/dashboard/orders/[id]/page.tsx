"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { apiFetch, type Order } from "@/lib/api";

export default function OrderDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<{ order: Order }>(`/admin/orders/${id}`);
      setOrder(data.order);
    } catch {
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function setStatus(status: Order["status"]) {
    if (!order) return;
    setSaving(true);
    try {
      const data = await apiFetch<{ order: Order }>(`/admin/orders/${id}`, {
        method: "PATCH",
        body: { status },
      });
      setOrder(data.order);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-muted">Loading…</p>;
  if (!order) {
    return (
      <div>
        <p className="text-red-500">Order not found.</p>
        <Link href="/dashboard/orders" className="mt-4 inline-block text-mauve-deep hover:underline">
          ← Back to orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <Link href="/dashboard/orders" className="text-sm text-mauve-deep hover:underline">
        ← Orders
      </Link>
      <h1 className="mt-4 font-serif text-3xl text-ink">Order #{order._id.slice(-6)}</h1>
      <p className="mt-1 text-sm text-muted">{new Date(order.createdAt).toLocaleString()}</p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-rose-100 bg-white p-5">
          <h2 className="text-xs font-semibold uppercase text-muted">Customer</h2>
          <p className="mt-2 font-medium">{order.customerName}</p>
          <p className="text-sm text-ink">
            {order.customerPhone || order.user?.number || "—"}
          </p>
          {order.user?.number && order.customerPhone && order.customerPhone !== order.user.number ? (
            <p className="text-xs text-muted">Checkout phone: {order.customerPhone}</p>
          ) : null}
          {order.customerEmail ? (
            <p className="text-xs text-muted">Email (checkout): {order.customerEmail}</p>
          ) : null}
        </div>
        <div className="rounded-xl border border-rose-100 bg-white p-5">
          <h2 className="text-xs font-semibold uppercase text-muted">Payment</h2>
          <p className="mt-2 text-sm font-medium capitalize text-ink">
            {order.paymentStatus === "submitted"
              ? "Customer marked payment done — verify in UPI app"
              : order.paymentStatus === "confirmed"
                ? "Payment confirmed"
                : "Awaiting UPI payment"}
          </p>
          {order.paymentReference ? (
            <p className="mt-2 text-sm">
              UPI ref: <span className="font-mono font-medium text-ink">{order.paymentReference}</span>
            </p>
          ) : null}
          {order.paymentSubmittedAt ? (
            <p className="mt-1 text-xs text-muted">
              Submitted {new Date(order.paymentSubmittedAt).toLocaleString()}
            </p>
          ) : null}
          <h2 className="mt-6 text-xs font-semibold uppercase text-muted">Order status</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {(["pending", "confirmed", "cancelled"] as const).map((s) => (
              <button
                key={s}
                type="button"
                disabled={saving || order.status === s}
                onClick={() => void setStatus(s)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize disabled:opacity-50 ${
                  order.status === s ? "bg-mauve-deep text-white" : "border border-rose-200 bg-white"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <p className="mt-4 font-serif text-2xl text-ink">₹{order.subtotal.toLocaleString("en-IN")}</p>
        </div>
      </div>

      {order.notes ? (
        <p className="mt-6 rounded-xl border border-rose-100 bg-rose-50/50 px-4 py-3 text-sm text-muted">
          <span className="font-semibold text-ink">Notes:</span> {order.notes}
        </p>
      ) : null}

      <h2 className="mt-10 text-xs font-semibold uppercase text-muted">Items</h2>
      <ul className="mt-4 divide-y rounded-xl border border-rose-100 bg-white">
        {order.items.map((item) => (
          <li key={item.cartKey} className="flex justify-between gap-4 px-4 py-4">
            <div>
              <p className="font-medium">{item.title}</p>
              <p className="text-xs capitalize text-muted">
                {item.type} · qty {item.quantity}
                {item.duration ? ` · ${item.duration}` : ""}
              </p>
            </div>
            <p className="shrink-0 font-medium">₹{(item.price * item.quantity).toLocaleString("en-IN")}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
