"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";

import { OfferForm } from "@/components/offer-form";
import { tierByKey } from "@/lib/membership-tiers";
import { apiFetch, type Offer } from "@/lib/api";

function NewTierForm() {
  const searchParams = useSearchParams();
  const tierParam = searchParams.get("tier") ?? "silver";
  const tier = tierByKey(tierParam);
  const [existingSlugs, setExistingSlugs] = useState<string[]>([]);

  const load = useCallback(async () => {
    try {
      const data = await apiFetch<{ offers: Offer[] }>("/offers?offerType=membership");
      setExistingSlugs(data.offers.map((o) => o.slug));
    } catch {
      setExistingSlugs([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <>
      <Link href="/dashboard/offers" className="text-sm font-semibold text-mauve-deep hover:underline">
        ← Back to tiers
      </Link>
      <h1 className="mt-4 font-serif text-3xl text-ink">Add {tier?.title ?? "membership"} tier</h1>
      <p className="mt-2 text-sm text-muted">This appears on the public Gift Cards page.</p>
      <div className="mt-8">
        <OfferForm initialTier={tierParam} existingSlugs={existingSlugs} />
      </div>
    </>
  );
}

export default function NewOfferPage() {
  return (
    <Suspense fallback={<p className="text-muted">Loading…</p>}>
      <NewTierForm />
    </Suspense>
  );
}
