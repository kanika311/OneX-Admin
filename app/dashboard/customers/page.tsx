"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { ApiError, apiFetch, type Customer } from "@/lib/api";
import { formatCustomerPhone } from "@/lib/format-phone";

function customerKey(c: Customer) {
  return c.id ? `user-${c.id}` : `guest-${c.number || c.email || c.name}`;
}

function ordersLink(c: Customer) {
  if (c.id) return `/dashboard/orders?userId=${encodeURIComponent(c.id)}`;
  if (c.number) return `/dashboard/orders?phone=${encodeURIComponent(c.number)}`;
  if (c.email) return `/dashboard/orders?email=${encodeURIComponent(c.email)}`;
  return "/dashboard/orders";
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch<{ customers: Customer[] }>("/admin/customers");
      setCustomers(data.customers ?? []);
    } catch (e) {
      setCustomers([]);
      const msg = e instanceof Error ? e.message : "Could not load customers";
      if (e instanceof ApiError && e.status === 401) {
        setError("Session expired. Please sign in again from the login page.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function repairPhones() {
    try {
      await apiFetch("/admin/customers/repair-phones", { method: "POST" });
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Could not repair phones");
    }
  }

  return (
    <div>
      <h1 className="font-serif text-3xl text-ink">Customers</h1>
     
     
      {error ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}

      {loading ? (
        <p className="mt-10 text-muted">Loading…</p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-xl border border-rose-100 bg-white">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b bg-rose-50/50 text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Orders</th>
                <th className="px-4 py-3">Total spent</th>
                <th className="px-4 py-3">Last order</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={customerKey(c)} className="border-b border-rose-50">
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3">{c.number}</td>
                  <td className="px-4 py-3 capitalize">{c.source}</td>
                  <td className="px-4 py-3">{c.orderCount}</td>
                  <td className="px-4 py-3">₹{c.totalSpent.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-muted">
                    {c.lastOrderAt ? new Date(c.lastOrderAt).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {c.orderCount > 0 ? (
                      <Link href={ordersLink(c)} className="text-mauve-deep hover:underline">
                        View orders
                      </Link>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {customers.length === 0 && !error ? (
            <p className="p-8 text-center text-muted">
              No customers yet. When someone signs up or checks out on the site, they will appear here.
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
