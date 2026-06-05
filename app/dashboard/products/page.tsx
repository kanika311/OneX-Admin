"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { apiFetch, type Product } from "@/lib/api";
import { productPublicPath, productPublicUrl } from "@/lib/product-site-url";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<{ products: Product[] }>("/products?limit=200");
      setProducts(data.products);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleDelete(product: Product) {
    const ok = window.confirm(
      `Delete "${product.title}" permanently? This cannot be undone.`,
    );
    if (!ok) return;

    setError("");
    setDeletingId(product._id);
    try {
      await apiFetch(`/products/${product._id}?hard=true`, { method: "DELETE" });
      setProducts((prev) => prev.filter((p) => p._id !== product._id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-ink">Products & Courses</h1>
          <p className="mt-2 text-sm text-muted">
            Active items appear on the public Services page, search, cart, and wishlist.
          </p>
        </div>
        <Link
          href="/dashboard/products/new"
          className="rounded-lg bg-mauve-deep px-5 py-2.5 text-sm font-semibold text-white"
        >
          + Add product
        </Link>
      </div>
      {error ? <p className="mt-4 text-sm text-red-500">{error}</p> : null}
      {loading ? (
        <p className="mt-10 text-muted">Loading…</p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-xl border border-rose-100 bg-white">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b bg-rose-50/50 text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">On site</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} className="border-b border-rose-50">
                  <td className="px-4 py-3">
                    <p className="font-medium">{p.title}</p>
                    <p className="text-xs text-muted">{productPublicPath(p)}</p>
                  </td>
                  <td className="px-4 py-3 capitalize">
                    {p.domain} · {p.category}
                  </td>
                  <td className="px-4 py-3">{p.duration}</td>
                  <td className="px-4 py-3">₹{p.price.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3">
                    {p.active ? (
                      <span className="text-green-700">Yes</span>
                    ) : (
                      <span className="text-muted">Hidden</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <Link href={`/dashboard/products/${p._id}`} className="text-mauve-deep hover:underline">
                        Edit
                      </Link>
                      <a
                        href={productPublicUrl(p)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted hover:text-ink hover:underline"
                      >
                        View
                      </a>
                      <button
                        type="button"
                        disabled={deletingId === p._id}
                        onClick={() => void handleDelete(p)}
                        className="text-red-600 hover:underline disabled:opacity-50"
                      >
                        {deletingId === p._id ? "Deleting…" : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 ? (
            <p className="p-8 text-center text-muted">
              No products yet. Add courses and services — they will show on the website when Active is checked.
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
