export const MEMBERSHIP_TIERS = [
  { key: "silver", title: "Silver", slug: "silver-membership", sortOrder: 1, defaultPrice: 1500 },
  { key: "gold", title: "Gold", slug: "gold-membership", sortOrder: 2, defaultPrice: 2500 },
  { key: "diamond", title: "Diamond", slug: "diamond-membership", sortOrder: 3, defaultPrice: 5000 },
] as const;

export type TierKey = (typeof MEMBERSHIP_TIERS)[number]["key"];

export function tierByKey(key: string) {
  return MEMBERSHIP_TIERS.find((t) => t.key === key);
}

export function tierBySlug(slug: string) {
  return MEMBERSHIP_TIERS.find((t) => t.slug === slug);
}

export function tierByTitle(title: string) {
  const lower = title.trim().toLowerCase();
  return MEMBERSHIP_TIERS.find((t) => t.title.toLowerCase() === lower || t.key === lower);
}
