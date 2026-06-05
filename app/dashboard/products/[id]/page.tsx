"use client";

import { useEffect, useState } from "react";

import { ProductForm } from "@/components/product-form";
import { apiFetch, type Product } from "@/lib/api";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    void params.then(({ id }) => {
      apiFetch<{ product: Product }>(`/products/${id}`)
        .then((d) => setProduct(d.product))
        .catch(() => setProduct(null));
    });
  }, [params]);

  if (!product) return <p className="text-muted">Loading…</p>;

  return (
    <div>
      <h1 className="font-serif text-3xl text-ink">Edit product</h1>
      <div className="mt-8">
        <ProductForm product={product} />
      </div>
    </div>
  );
}
