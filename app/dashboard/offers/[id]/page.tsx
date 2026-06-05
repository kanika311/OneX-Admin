"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { OfferForm } from "@/components/offer-form";
import { apiFetch, type Offer } from "@/lib/api";

export default function EditOfferPage({ params }: { params: Promise<{ id: string }> }) {
  const [offer, setOffer] = useState<Offer | null>(null);

  useEffect(() => {
    void params.then(({ id }) => {
      apiFetch<{ offer: Offer }>(`/offers/${id}`)
        .then((d) => setOffer(d.offer))
        .catch(() => setOffer(null));
    });
  }, [params]);

  if (!offer) return <p className="text-muted">Loading…</p>;

  return (
    <div>
      <Link href="/dashboard/offers" className="text-sm font-semibold text-mauve-deep hover:underline">
        ← Back to tiers
      </Link>
      <h1 className="mt-4 font-serif text-3xl text-ink">Edit {offer.title} tier</h1>
      <div className="mt-8">
        <OfferForm key={offer._id} offer={offer} />
      </div>
    </div>
  );
}
