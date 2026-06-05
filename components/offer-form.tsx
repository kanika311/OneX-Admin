"use client";

import { Formik } from "formik";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import * as Yup from "yup";

import { MEMBERSHIP_TIERS, tierByKey, tierBySlug, type TierKey } from "@/lib/membership-tiers";
import { membershipPayload } from "@/lib/membership-payload";
import { apiFetch, type Offer } from "@/lib/api";

const inputClass =
  "mt-1 w-full rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm outline-none focus:border-mauve";

const DEFAULT_BENEFITS = [
  "Access to exclusive member rewards",
  "Priority booking access",
  "Insider discounts",
  "Special promotional offers",
  "Community member benefits",
].join("\n");

const schema = Yup.object({
  tierKey: Yup.string().oneOf(["silver", "gold", "diamond"]).required("Select a tier"),
  price: Yup.number().min(1, "Enter a price greater than 0").required("Price is required"),
});

function resolveTierKey(offer?: Offer, initialTier?: string): TierKey {
  if (initialTier && tierByKey(initialTier)) return initialTier as TierKey;
  if (offer) {
    const fromSlug = tierBySlug(offer.slug);
    if (fromSlug) return fromSlug.key;
    const fromTitle = MEMBERSHIP_TIERS.find((t) => t.title === offer.title);
    if (fromTitle) return fromTitle.key;
  }
  return "silver";
}

function toValues(offer?: Offer, initialTier?: string) {
  const tierKey = resolveTierKey(offer, initialTier);
  const tier = tierByKey(tierKey)!;
  return {
    tierKey,
    subtitle: offer?.subtitle ?? "Premium wellness & cyber access",
    cardTitle: offer?.cardTitle ?? "Founding Member",
    price: offer?.price && offer.price > 0 ? offer.price : tierByKey(tierKey)?.defaultPrice ?? 0,
    feeLabel: offer?.feeLabel ?? "One-time fee",
    benefitsText: (offer?.benefits?.length ? offer.benefits : DEFAULT_BENEFITS.split("\n")).join("\n"),
    ctaText: offer?.ctaText ?? "Get Your Membership Card",
    ctaLink: offer?.ctaLink ?? "/contact",
    active: offer?.active ?? true,
  };
}

export function OfferForm({
  offer,
  initialTier,
  existingSlugs = [],
}: {
  offer?: Offer;
  initialTier?: string;
  /** Slugs already in DB — hide those tiers from “add” picker */
  existingSlugs?: string[];
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const isEdit = Boolean(offer?._id);

  const availableTiers = useMemo(() => {
    if (isEdit) return MEMBERSHIP_TIERS;
    return MEMBERSHIP_TIERS.filter((t) => !existingSlugs.includes(t.slug));
  }, [isEdit, existingSlugs]);

  return (
    <Formik
      initialValues={toValues(offer, initialTier)}
      validationSchema={schema}
      enableReinitialize
      onSubmit={async (values, { setSubmitting }) => {
        setError("");
        const tier = tierByKey(values.tierKey);
        if (!tier) {
          setError("Invalid tier");
          setSubmitting(false);
          return;
        }
        const body = {
          ...membershipPayload(values.tierKey as TierKey, offer, {
            price: Number(values.price),
          }),
          subtitle: values.subtitle.trim(),
          description: values.subtitle.trim() || `${tier.title} founding member tier`,
          cardTitle: values.cardTitle.trim(),
          feeLabel: values.feeLabel.trim(),
          benefits: values.benefitsText.split("\n").map((b) => b.trim()).filter(Boolean),
          ctaText: values.ctaText.trim(),
          ctaLink: values.ctaLink.trim() || "/contact",
          active: values.active,
        };
        try {
          if (isEdit) await apiFetch(`/offers/${offer!._id}`, { method: "PUT", body });
          else await apiFetch("/offers", { method: "POST", body });
          router.push("/dashboard/offers");
          router.refresh();
        } catch (e) {
          setError(e instanceof Error ? e.message : "Save failed");
          setSubmitting(false);
        }
      }}
    >
      {({ values, handleChange, handleSubmit, isSubmitting, setFieldValue }) => (
        <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase text-muted">Membership tier</label>
            {isEdit ? (
              <p className="mt-1 rounded-lg border border-rose-100 bg-rose-50/50 px-3 py-2.5 text-sm font-semibold text-ink">
                {tierByKey(values.tierKey)?.title ?? values.tierKey}
              </p>
            ) : availableTiers.length === 0 ? (
              <p className="mt-1 text-sm text-red-500">Silver, Gold, and Diamond already exist. Edit or delete one first.</p>
            ) : (
              <select
                name="tierKey"
                className={inputClass}
                value={values.tierKey}
                onChange={(e) => void setFieldValue("tierKey", e.target.value)}
              >
                {availableTiers.map((t) => (
                  <option key={t.key} value={t.key}>
                    {t.title}
                  </option>
                ))}
              </select>
            )}
          </div>

          <fieldset className="space-y-4 rounded-xl border border-rose-100 bg-rose-50/30 p-4">
            <legend className="px-1 text-xs font-semibold uppercase text-muted">Membership card (Gift Cards page)</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold uppercase text-muted">Card title</label>
                <input name="cardTitle" className={inputClass} value={values.cardTitle} onChange={handleChange} />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-muted">Price (₹)</label>
                <input
                  name="price"
                  type="number"
                  min={1}
                  step={1}
                  className={inputClass}
                  value={values.price}
                  onChange={(e) => void setFieldValue("price", Number(e.target.value))}
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-muted">Card subtitle</label>
              <input name="subtitle" className={inputClass} value={values.subtitle} onChange={handleChange} />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-muted">Fee label</label>
              <input name="feeLabel" className={inputClass} value={values.feeLabel} onChange={handleChange} />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-muted">Benefits (one per line)</label>
              <textarea
                name="benefitsText"
                rows={6}
                className={inputClass}
                value={values.benefitsText}
                onChange={handleChange}
              />
            </div>
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold uppercase text-muted">Button text</label>
              <input name="ctaText" className={inputClass} value={values.ctaText} onChange={handleChange} />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-muted">Button link</label>
              <input name="ctaLink" className={inputClass} value={values.ctaLink} onChange={handleChange} placeholder="/contact" />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="active" checked={values.active} onChange={handleChange} /> Show on website
          </label>

          {error ? <p className="text-sm text-red-500">{error}</p> : null}
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={isSubmitting || (!isEdit && availableTiers.length === 0)}
              className="rounded-lg bg-mauve-deep px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {isSubmitting ? "Saving…" : isEdit ? "Save changes" : "Add tier"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/dashboard/offers")}
              className="rounded-lg border border-rose-200 px-6 py-2.5 text-sm font-semibold text-ink"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </Formik>
  );
}
