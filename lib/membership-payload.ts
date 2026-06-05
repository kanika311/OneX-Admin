import { MEMBERSHIP_TIERS, type TierKey } from "@/lib/membership-tiers";
import type { Offer } from "@/lib/api";

const DEFAULT_BENEFITS = [
  "Access to exclusive member rewards",
  "Priority booking access",
  "Insider discounts",
  "Special promotional offers",
  "Community member benefits",
];

export function membershipPayload(
  tierKey: TierKey,
  offer?: Offer,
  overrides?: { price?: number; contactPhone?: string },
) {
  const tier = MEMBERSHIP_TIERS.find((t) => t.key === tierKey)!;
  const price =
    overrides?.price ??
    (offer?.price && offer.price > 0 ? offer.price : tier.defaultPrice);
  const contactPhone =
    overrides?.contactPhone !== undefined
      ? overrides.contactPhone
      : (offer?.contactPhone ?? "");

  const subtitle = offer?.subtitle ?? "Premium wellness & cyber access";

  return {
    offerType: "membership" as const,
    slug: tier.slug,
    title: tier.title,
    sortOrder: tier.sortOrder,
    subtitle,
    description: offer?.description?.trim() || subtitle,
    cardTitle: offer?.cardTitle ?? "Founding Member",
    price: Math.max(1, Number(price) || tier.defaultPrice),
    feeLabel: offer?.feeLabel ?? "One-time fee",
    benefits:
      offer?.benefits?.length && offer.benefits.length > 0
        ? offer.benefits
        : DEFAULT_BENEFITS,
    contactPhone: String(contactPhone).replace(/\D/g, ""),
    ctaText: offer?.ctaText ?? "Get Your Membership Card",
    ctaLink: offer?.ctaLink ?? "/contact",
    active: offer?.active ?? true,
  };
}
