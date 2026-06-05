"use client";

import { Formik } from "formik";
import { useRouter } from "next/navigation";
import { useState } from "react";
import * as Yup from "yup";

import { FormFieldError } from "@/components/form-field-error";
import { ImageUploadField } from "@/components/image-upload-field";
import { apiFetch, getToken, type Product } from "@/lib/api";
import { toUploadStoragePath } from "@/lib/media-url";

const inputClass =
  "mt-1 w-full rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm outline-none focus:border-mauve";

const schema = Yup.object({
  slug: Yup.string().required(),
  domain: Yup.string().oneOf(["cyber", "physio"]).required(),
  category: Yup.string().oneOf(["courses", "services", "therapy"]).required(),
  title: Yup.string().required(),
  description: Yup.string().required(),
  duration: Yup.string().required(),
  price: Yup.number().min(0).required(),
  image: Yup.string().required(),
  iconKey: Yup.string().required(),
});

type Values = {
  slug: string;
  domain: "cyber" | "physio";
  category: "courses" | "services" | "therapy";
  title: string;
  description: string;
  duration: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  iconKey: string;
  cta: string;
  bestseller: boolean;
  active: boolean;
  benefitsText: string;
  faqText: string;
};

function toValues(p?: Product): Values {
  return {
    slug: p?.slug ?? "",
    domain: p?.domain ?? "cyber",
    category: p?.category ?? "courses",
    title: p?.title ?? "",
    description: p?.description ?? "",
    duration: p?.duration ?? "",
    price: p?.price ?? 0,
    rating: p?.rating ?? 4.8,
    reviews: p?.reviews ?? 0,
    image: toUploadStoragePath(p?.image ?? ""),
    iconKey: p?.iconKey ?? "shield",
    cta: p?.cta ?? "Enroll now",
    bestseller: p?.bestseller ?? false,
    active: p?.active ?? true,
    benefitsText: (p?.benefits ?? []).join("\n"),
    faqText: (p?.faq ?? []).map((f) => `${f.q}|${f.a}`).join("\n"),
  };
}

function parseFaq(text: string) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [q, ...rest] = line.split("|");
      return { q: (q ?? "").trim(), a: rest.join("|").trim() || "—" };
    })
    .filter((f) => f.q);
}

const requiredLabels: Record<string, string> = {
  title: "Title",
  slug: "Slug",
  description: "Description",
  duration: "Duration",
  price: "Price",
  image: "Image (upload or paste URL)",
};

export function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [showAllErrors, setShowAllErrors] = useState(false);
  const isEdit = Boolean(product?._id);

  return (
    <Formik
      initialValues={toValues(product)}
      validationSchema={schema}
      onSubmit={async (values, { setSubmitting }) => {
        setError("");
        setShowAllErrors(false);
        if (!getToken()) {
          setError("You are not logged in. Open Login and sign in as admin, then try again.");
          setSubmitting(false);
          return;
        }
        const body = {
          slug: values.slug.trim(),
          domain: values.domain,
          category: values.category,
          title: values.title,
          description: values.description,
          duration: values.duration,
          price: Number(values.price),
          rating: Number(values.rating),
          reviews: Number(values.reviews),
          image: toUploadStoragePath(values.image),
          iconKey: values.iconKey,
          cta: values.cta,
          bestseller: values.bestseller,
          active: values.active,
          benefits: values.benefitsText.split("\n").map((s) => s.trim()).filter(Boolean),
          faq: parseFaq(values.faqText),
        };
        try {
          if (isEdit) {
            await apiFetch(`/products/${product!._id}`, { method: "PUT", body });
          } else {
            await apiFetch("/products", { method: "POST", body });
          }
          router.push("/dashboard/products");
          router.refresh();
        } catch (e) {
          const msg = e instanceof Error ? e.message : "Save failed";
          setError(msg);
          setShowAllErrors(false);
          setSubmitting(false);
        }
      }}
    >
      {({
        values,
        touched,
        errors,
        handleChange,
        handleSubmit,
        isSubmitting,
        setFieldValue,
        validateForm,
        setTouched,
      }) => {
        const missingRequired = Object.keys(requiredLabels).filter((key) => {
          const v = values[key as keyof Values];
          if (key === "price") return v === "" || v === undefined || Number.isNaN(Number(v));
          return !String(v ?? "").trim();
        });

        return (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setError("");
            const validationErrors = await validateForm();
            if (Object.keys(validationErrors).length > 0) {
              setShowAllErrors(true);
              void setTouched(
                Object.keys(values).reduce<Record<string, boolean>>((acc, key) => {
                  acc[key] = true;
                  return acc;
                }, {}),
              );
              const labels = Object.keys(validationErrors)
                .map((k) => requiredLabels[k] || k)
                .filter(Boolean);
              setError(
                labels.length
                  ? `Please fix: ${labels.join(", ")}.`
                  : "Please complete all required fields.",
              );
              return;
            }
            handleSubmit(e);
          }}
          className="max-w-2xl space-y-4"
        >
          {showAllErrors && missingRequired.length > 0 ? (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              Missing: {missingRequired.map((k) => requiredLabels[k]).join(", ")}
            </p>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold uppercase text-muted">Title *</label>
              <input name="title" className={inputClass} value={values.title} onChange={handleChange} />
              <FormFieldError name="title" errors={errors} touched={touched} showAll={showAllErrors} />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-muted">Slug *</label>
              <input name="slug" className={inputClass} value={values.slug} onChange={handleChange} placeholder="e.g. cyber-basics" />
              <FormFieldError name="slug" errors={errors} touched={touched} showAll={showAllErrors} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="text-xs font-semibold uppercase text-muted">Domain</label>
              <select name="domain" className={inputClass} value={values.domain} onChange={handleChange}>
                <option value="cyber">Cyber</option>
                <option value="physio">Physio</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-muted">Category</label>
              <select name="category" className={inputClass} value={values.category} onChange={handleChange}>
                <option value="courses">Courses</option>
                <option value="services">Services</option>
                <option value="therapy">Therapy</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-muted">Price (₹) *</label>
              <input name="price" type="number" min={0} className={inputClass} value={values.price} onChange={handleChange} />
              <FormFieldError name="price" errors={errors} touched={touched} showAll={showAllErrors} />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase text-muted">Description *</label>
            <textarea name="description" rows={4} className={inputClass} value={values.description} onChange={handleChange} />
            <FormFieldError name="description" errors={errors} touched={touched} showAll={showAllErrors} />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase text-muted">Duration *</label>
            <input name="duration" className={inputClass} value={values.duration} onChange={handleChange} placeholder="e.g. 8 weeks" />
            <FormFieldError name="duration" errors={errors} touched={touched} showAll={showAllErrors} />
          </div>
          <ImageUploadField value={values.image} onChange={(url) => void setFieldValue("image", url)} />
          <FormFieldError name="image" errors={errors} touched={touched} showAll={showAllErrors} />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold uppercase text-muted">Icon key</label>
              <input name="iconKey" className={inputClass} value={values.iconKey} onChange={handleChange} />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-muted">CTA</label>
              <input name="cta" className={inputClass} value={values.cta} onChange={handleChange} />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase text-muted">Benefits (one per line)</label>
            <textarea name="benefitsText" rows={3} className={inputClass} value={values.benefitsText} onChange={handleChange} />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase text-muted">FAQ (question|answer per line)</label>
            <textarea
              name="faqText"
              rows={3}
              className={inputClass}
              value={values.faqText}
              onChange={handleChange}
              placeholder="Beginner friendly?|Yes, foundational modules included."
            />
          </div>
          <p className="text-xs text-muted">
            Public URL:{" "}
            <span className="font-mono text-ink">
              /services/{values.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-") || "your-slug"}
            </span>
          </p>
          {isEdit && product ? (
            <p className="text-xs text-muted">
              <a
                href={`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/services/${product.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-mauve-deep hover:underline"
              >
                View on website →
              </a>
            </p>
          ) : null}
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="bestseller" checked={values.bestseller} onChange={handleChange} /> Bestseller
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="active" checked={values.active} onChange={handleChange} /> Active
          </label>
          {error ? <p className="text-sm text-red-500">{error}</p> : null}
          <button type="submit" disabled={isSubmitting} className="rounded-lg bg-mauve-deep px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
            {isSubmitting ? "Saving…" : isEdit ? "Update" : "Create"}
          </button>
        </form>
        );
      }}
    </Formik>
  );
}
