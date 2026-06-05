"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { MEMBERSHIP_TIERS } from "@/lib/membership-tiers";
import { apiFetch, type Offer } from "@/lib/api";

function matchTier(offer: Offer) {
  return MEMBERSHIP_TIERS.find(
    (t) => t.slug === offer.slug || t.title.toLowerCase() === offer.title?.toLowerCase(),
  );
}

function formatSavedPrice(offer?: Offer) {
  if (!offer || !offer.price || offer.price <= 0) return null;
  return `₹${offer.price.toLocaleString("en-IN")}`;
}

export default function GiftCardTiersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<{ offers: Offer[] }>("/offers?offerType=membership");
      setOffers(data.offers);
    } catch {
      setOffers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const rows = useMemo(() => {
    return MEMBERSHIP_TIERS.map((tier) => {
      const offer = offers.find((o) => matchTier(o)?.key === tier.key);
      return { tier, offer };
    });
  }, [offers]);

  const missingTiers = rows.filter((r) => !r.offer);

  async function remove(id: string, title: string) {
    if (!confirm(`Delete ${title} tier permanently?`)) return;
    try {
      await apiFetch(`/offers/${id}?hard=true`, { method: "DELETE" });
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed");
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-ink">Gift card tiers</h1>
          <p className="mt-2 text-sm text-muted">Manage Silver, Gold, and Diamond on the public Gift Cards page.</p>
        </div>
        {missingTiers.length > 0 ? (
          <Link
            href={`/dashboard/offers/new?tier=${missingTiers[0].tier.key}`}
            className="rounded-lg bg-mauve-deep px-5 py-2.5 text-sm font-semibold text-white"
          >
            + Add {missingTiers[0].tier.title}
          </Link>
        ) : null}
      </div>

      <div className="mt-8 overflow-x-auto rounded-xl border border-rose-100 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-rose-50/50 text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Tier</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">On site</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted">
                  Loading…
                </td>
              </tr>
            ) : (
              rows.map(({ tier, offer }) => {
                const priceLabel = formatSavedPrice(offer);
                return (
                  <tr key={tier.key} className="border-b">
                    <td className="px-4 py-3 font-semibold text-ink">{tier.title}</td>
                    <td className="px-4 py-3">
                      {priceLabel ?? <span className="text-muted">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      {offer ? (
                        offer.active ? (
                          <span className="text-green-700">Yes</span>
                        ) : (
                          <span className="text-muted">Hidden</span>
                        )
                      ) : (
                        <span className="text-muted">Not added</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {offer ? (
                        <span className="inline-flex gap-4">
                          <Link
                            href={`/dashboard/offers/${offer._id}`}
                            className="font-semibold text-mauve-deep hover:underline"
                          >
                            Edit
                          </Link>
                          <button
                            type="button"
                            onClick={() => void remove(offer._id, tier.title)}
                            className="font-semibold text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        </span>
                      ) : (
                        <Link
                          href={`/dashboard/offers/new?tier=${tier.key}`}
                          className="font-semibold text-mauve-deep hover:underline"
                        >
                          Add
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
