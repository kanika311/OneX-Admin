import type { Product } from "@/lib/api";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export function productPublicPath(p: Pick<Product, "slug">) {
  return `/services/${p.slug}`;
}

export function productPublicUrl(p: Pick<Product, "domain" | "category" | "slug">) {
  return `${SITE}${productPublicPath(p)}`;
}
