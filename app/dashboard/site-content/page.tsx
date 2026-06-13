"use client";

import { Formik } from "formik";
import { useEffect, useMemo, useState } from "react";
import * as Yup from "yup";

import { HeroSlidesEditor, type HeroSlide } from "@/components/hero-slides-editor";
import { ImageUploadField } from "@/components/image-upload-field";
import { apiFetch } from "@/lib/api";

type LegalSection = { heading: string; body: string };
type LegalDoc = { title: string; intro: string; sections: LegalSection[] };
type Contact = {
  headline: string;
  subheadline: string;
  address: string;
  email: string;
  phone: string;
  whatsapp: string;
  linkedin: string;
};

type About = {
  storyParagraph1: string;
  storyParagraph2: string;
  visionTitle: string;
  visionText: string;
};

type Founder = {
  eyebrow: string;
  title: string;
  body: string;
  image: string;
};

type Payment = {
  upiId: string;
  upiPayeeName: string;
  qrImage: string;
};

type SiteContent = {
  key: string;
  about: About;
  founder?: Founder;
  homeHeroSlides?: HeroSlide[];
  contact: Contact;
  payment?: Payment;
  privacy: LegalDoc;
  terms: LegalDoc;
};

const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  { mediaType: "image", src: "/cyber.png", alt: "Cybersecurity" },
  {
    mediaType: "image",
    src: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1400&h=900&fit=crop&q=72&auto=format",
    alt: "Wellness studio",
  },
  { mediaType: "image", src: "/Logo.jpeg", alt: "1X" },
];

const inputClass =
  "mt-1 w-full rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm outline-none focus:border-mauve";

function legalSectionsToText(sections: LegalSection[]) {
  return (sections || [])
    .map((s) => `${(s.heading || "").trim()}|${(s.body || "").trim()}`.trim())
    .filter(Boolean)
    .join("\n");
}

function legalTextToSections(text: string): LegalSection[] {
  return (text || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [heading, ...rest] = line.split("|");
      return { heading: (heading || "").trim(), body: rest.join("|").trim() };
    })
    .filter((s) => s.heading || s.body);
}

const schema = Yup.object({
  contactHeadline: Yup.string().required(),
  contactEmail: Yup.string().email().required(),
  contactPhone: Yup.string().required(),
  privacyTitle: Yup.string().required(),
  privacyIntro: Yup.string().required(),
  termsTitle: Yup.string().required(),
  termsIntro: Yup.string().required(),
});

export default function SiteContentPage() {
  const [initial, setInitial] = useState<SiteContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    apiFetch<{ content: SiteContent | null }>("/site-content")
      .then((d) => setInitial(d.content))
      .catch(() => setInitial(null))
      .finally(() => setLoading(false));
  }, []);

  const initValues = useMemo(() => {
    const about = initial?.about ?? ({} as Partial<About>);
    const founder = initial?.founder ?? ({} as Partial<Founder>);
    const contact = initial?.contact ?? ({} as Partial<Contact>);
    const payment = initial?.payment ?? ({} as Partial<Payment>);
    const privacy = initial?.privacy ?? ({} as Partial<LegalDoc>);
    const terms = initial?.terms ?? ({} as Partial<LegalDoc>);
    const heroSlides =
      initial?.homeHeroSlides && initial.homeHeroSlides.length > 0
        ? initial.homeHeroSlides
        : DEFAULT_HERO_SLIDES;
    return {
      homeHeroSlides: heroSlides,
      aboutStory1:
        about.storyParagraph1 ??
        "Dr. Ayxh founded 1X to unite two worlds: luxury physiotherapy that restores movement and confidence, and rigorous cybersecurity that opens doors in a high-demand industry. Every service we provide reflects the same standard — premium, personal, and outcome-driven.",
      aboutStory2:
        about.storyParagraph2 ??
        "Alignment in the body, encryption in the code. Balance is everything.\nFixing your posture and your passwords. You need both — that's why you have 1X by Dr. Ayxh.",
      aboutVisionTitle: about.visionTitle ?? "Vision",
      aboutVisionText:
        about.visionText ??
        "A world where wellness and digital literacy are equally accessible, delivered with the care of a luxury brand and the rigor of experts.",
      founderEyebrow: founder.eyebrow ?? "About the founder",
      founderTitle: founder.title ?? "Dr. Ayxh, Founder of 1X",
      founderBody:
        founder.body ??
        `Raised across multiple cultures and faiths, she grew up seeing how safety, identity, and dignity intersect. That perspective shaped everything.

With degrees in business, tech, medicine, and fashion, Ayxh brings a rare mix: the precision of a doctor + physiotherapist, the mindset of an ethical hacker, and the eye of a designer. She speaks multiple languages. She is a Polymath and Builder.

She built 1X to reimagine security — not as guards and gates, but as luxury + care. High-trust protection meets therapy, wellness, and human-first service. Because safety should feel as good as it looks.

She started 1X with one vision: security and therapy that feel luxurious, not intimidating. Services built on discretion, empathy, and cutting-edge tech — so clients feel protected, not policed.`,
      founderImage: founder.image ?? "",
      contactHeadline: contact.headline ?? "Get in touch",
      contactSubheadline: contact.subheadline ?? "Book a 1-on-1 consult/collab with Dr. Ayxh.",
      contactAddress:
        contact.address ??
        "1X Wellness & Cyber Campus, Based on Kolkata, Pune, Noida and working globally",
      contactEmail: contact.email ?? "dr.ayxhbusiness@gmail.com",
      contactPhone: contact.phone ?? "+91 6289672438",
      contactWhatsApp: contact.whatsapp ?? "+91 6289672438",
      contactLinkedIn:
        contact.linkedin ??
        "https://www.linkedin.com/in/dr-ayxh-baby-%E0%A4%90%E0%A4%B6%E0%A5%8D-abram-aymed-5b388b22b?utm_source=share_via&utm_content=profile&utm_medium=member_android",
      paymentUpiId: payment.upiId ?? "ayeshaaahmedsinghrockzzz@okhdfcbank",
      paymentPayeeName: payment.upiPayeeName ?? "Dr. Ayxh Abram",
      paymentQrImage: payment.qrImage ?? "",
      privacyTitle: privacy.title ?? "Privacy Policy",
      privacyIntro:
        privacy.intro ??
        "We respect your privacy. This policy explains what we collect when you browse, book, or purchase through 1X.",
      privacySectionsText: legalSectionsToText((privacy.sections || []) as LegalSection[]),
      termsTitle: terms.title ?? "Terms & Conditions",
      termsIntro:
        terms.intro ??
        "By using this website and purchasing programs or therapy, you agree to the following terms.",
      termsSectionsText: legalSectionsToText((terms.sections || []) as LegalSection[]),
    };
  }, [initial]);

  if (loading) {
    return (
      <div>
        <h1 className="font-serif text-3xl text-ink">Site content</h1>
        <p className="mt-3 text-sm text-muted">Loading…</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <h1 className="font-serif text-3xl text-ink">Site content</h1>
      <p className="mt-2 text-sm text-muted">
        Edit homepage, About page (founder), Contact, UPI payment QR, Privacy, and Terms.
      </p>

      <Formik
        enableReinitialize
        initialValues={initValues}
        validationSchema={schema}
        onSubmit={async (values, { setSubmitting }) => {
          setError("");
          setMessage("");
          try {
            const payload = {
              about: {
                storyParagraph1: values.aboutStory1.trim(),
                storyParagraph2: values.aboutStory2.trim(),
                visionTitle: values.aboutVisionTitle.trim(),
                visionText: values.aboutVisionText.trim(),
              },
              founder: {
                eyebrow: values.founderEyebrow.trim(),
                title: values.founderTitle.trim(),
                body: values.founderBody.trim(),
                image: values.founderImage.trim(),
              },
              homeHeroSlides: values.homeHeroSlides
                .filter((s) => s.src.trim())
                .map((s) => ({
                  mediaType: s.mediaType === "video" ? "video" : "image",
                  src: s.src.trim(),
                  alt: s.alt.trim(),
                })),
              contact: {
                headline: values.contactHeadline.trim(),
                subheadline: values.contactSubheadline.trim(),
                address: values.contactAddress.trim(),
                email: values.contactEmail.trim(),
                phone: values.contactPhone.trim(),
                whatsapp: values.contactWhatsApp.trim(),
                linkedin: values.contactLinkedIn.trim(),
              },
              payment: {
                upiId: values.paymentUpiId.trim(),
                upiPayeeName: values.paymentPayeeName.trim(),
                qrImage: values.paymentQrImage.trim(),
              },
              privacy: {
                title: values.privacyTitle.trim(),
                intro: values.privacyIntro.trim(),
                sections: legalTextToSections(values.privacySectionsText),
              },
              terms: {
                title: values.termsTitle.trim(),
                intro: values.termsIntro.trim(),
                sections: legalTextToSections(values.termsSectionsText),
              },
            };

            await apiFetch("/site-content", { method: "PUT", body: payload });
            setMessage("Saved. Refresh the website to see updates.");
          } catch (e) {
            setError(e instanceof Error ? e.message : "Save failed");
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting, setFieldValue }) => (
          <form onSubmit={handleSubmit} className="mt-10 space-y-10">
            <section className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm">
              <h2 className="font-serif text-xl text-ink">Homepage</h2>
              <p className="mt-1 text-xs text-muted">Hero slider, story, and vision on the main landing page (/).</p>
              <div className="mt-4 space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-ink">Home hero slider</h3>
                  <p className="mt-1 text-xs text-muted">
                    Add multiple images or videos. Order = slide order on the homepage.
                  </p>
                  <div className="mt-4">
                    <HeroSlidesEditor
                      slides={values.homeHeroSlides}
                      onChange={(slides) => void setFieldValue("homeHeroSlides", slides)}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-muted">Story — paragraph 1</label>
                  <textarea
                    rows={4}
                    name="aboutStory1"
                    className={inputClass}
                    value={values.aboutStory1}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-muted">
                    Story — paragraph 2 (use new lines for line breaks)
                  </label>
                  <textarea
                    rows={4}
                    name="aboutStory2"
                    className={inputClass}
                    value={values.aboutStory2}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-muted">Vision title</label>
                  <input
                    name="aboutVisionTitle"
                    className={inputClass}
                    value={values.aboutVisionTitle}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-muted">Vision text</label>
                  <textarea
                    rows={3}
                    name="aboutVisionText"
                    className={inputClass}
                    value={values.aboutVisionText}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm">
              <h2 className="font-serif text-xl text-ink">About page — founder</h2>
              <p className="mt-1 text-xs text-muted">
                Public page at /about — About the founder section with photo.
              </p>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="text-xs font-semibold uppercase text-muted">Eyebrow label</label>
                  <input
                    name="founderEyebrow"
                    className={inputClass}
                    value={values.founderEyebrow}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-muted">Title</label>
                  <input
                    name="founderTitle"
                    className={inputClass}
                    value={values.founderTitle}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-muted">
                    Story (blank line between paragraphs)
                  </label>
                  <textarea
                    rows={12}
                    name="founderBody"
                    className={inputClass}
                    value={values.founderBody}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </div>
                <ImageUploadField
                  label="Founder photo"
                  value={values.founderImage}
                  onChange={(url) => void setFieldValue("founderImage", url)}
                />
              </div>
            </section>

            <section className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm">
              <h2 className="font-serif text-xl text-ink">Contact & footer</h2>
              <p className="mt-1 text-xs text-muted">
                Email also appears in the site footer and on this admin Contact messages page.
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold uppercase text-muted">Headline</label>
                  <input
                    name="contactHeadline"
                    className={inputClass}
                    value={values.contactHeadline}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {touched.contactHeadline && errors.contactHeadline ? (
                    <p className="mt-1 text-xs text-red-500">{String(errors.contactHeadline)}</p>
                  ) : null}
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold uppercase text-muted">Subheadline</label>
                  <input
                    name="contactSubheadline"
                    className={inputClass}
                    value={values.contactSubheadline}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold uppercase text-muted">Address</label>
                  <textarea
                    rows={3}
                    name="contactAddress"
                    className={inputClass}
                    value={values.contactAddress}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-muted">Email</label>
                  <input
                    name="contactEmail"
                    type="email"
                    className={inputClass}
                    value={values.contactEmail}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {touched.contactEmail && errors.contactEmail ? (
                    <p className="mt-1 text-xs text-red-500">{String(errors.contactEmail)}</p>
                  ) : null}
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-muted">Phone</label>
                  <input
                    name="contactPhone"
                    className={inputClass}
                    value={values.contactPhone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {touched.contactPhone && errors.contactPhone ? (
                    <p className="mt-1 text-xs text-red-500">{String(errors.contactPhone)}</p>
                  ) : null}
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-muted">WhatsApp</label>
                  <input
                    name="contactWhatsApp"
                    className={inputClass}
                    value={values.contactWhatsApp}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-muted">LinkedIn URL</label>
                  <input
                    name="contactLinkedIn"
                    className={inputClass}
                    value={values.contactLinkedIn}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm">
              <h2 className="font-serif text-xl text-ink">UPI payment QR</h2>
              <p className="mt-1 text-xs text-muted">
                Shown at checkout when customers pay. Upload a QR image from your UPI app, or leave it empty to
                auto-generate a QR from the UPI ID below.
              </p>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="text-xs font-semibold uppercase text-muted">UPI ID (VPA)</label>
                  <input
                    name="paymentUpiId"
                    className={inputClass}
                    value={values.paymentUpiId}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="name@okhdfcbank"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-muted">Payee name</label>
                  <input
                    name="paymentPayeeName"
                    className={inputClass}
                    value={values.paymentPayeeName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Dr. Ayxh Abram"
                  />
                </div>
                <ImageUploadField
                  label="Payment QR image (optional)"
                  value={values.paymentQrImage}
                  onChange={(url) => void setFieldValue("paymentQrImage", url)}
                />
              </div>
            </section>

            <section className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm">
              <h2 className="font-serif text-xl text-ink">Privacy Policy</h2>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="text-xs font-semibold uppercase text-muted">Title</label>
                  <input
                    name="privacyTitle"
                    className={inputClass}
                    value={values.privacyTitle}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {touched.privacyTitle && errors.privacyTitle ? (
                    <p className="mt-1 text-xs text-red-500">{String(errors.privacyTitle)}</p>
                  ) : null}
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-muted">Intro</label>
                  <textarea
                    rows={3}
                    name="privacyIntro"
                    className={inputClass}
                    value={values.privacyIntro}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {touched.privacyIntro && errors.privacyIntro ? (
                    <p className="mt-1 text-xs text-red-500">{String(errors.privacyIntro)}</p>
                  ) : null}
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-muted">
                    Sections (one per line: <code>Heading|Body</code>)
                  </label>
                  <textarea
                    rows={8}
                    name="privacySectionsText"
                    className={inputClass}
                    value={values.privacySectionsText}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder={"Information we collect|We may collect your name...\nHow we use it|Your data is used to..."}
                  />
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm">
              <h2 className="font-serif text-xl text-ink">Terms & Conditions</h2>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="text-xs font-semibold uppercase text-muted">Title</label>
                  <input
                    name="termsTitle"
                    className={inputClass}
                    value={values.termsTitle}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {touched.termsTitle && errors.termsTitle ? (
                    <p className="mt-1 text-xs text-red-500">{String(errors.termsTitle)}</p>
                  ) : null}
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-muted">Intro</label>
                  <textarea
                    rows={3}
                    name="termsIntro"
                    className={inputClass}
                    value={values.termsIntro}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {touched.termsIntro && errors.termsIntro ? (
                    <p className="mt-1 text-xs text-red-500">{String(errors.termsIntro)}</p>
                  ) : null}
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-muted">
                    Sections (one per line: <code>Heading|Body</code>)
                  </label>
                  <textarea
                    rows={8}
                    name="termsSectionsText"
                    className={inputClass}
                    value={values.termsSectionsText}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder={"Services|Course content may change...\nPayments & refunds|Fees are stated in INR..."}
                  />
                </div>
              </div>
            </section>

            {error ? (
              <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            ) : null}
            {message ? (
              <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                {message}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-mauve-deep px-6 py-3 text-sm font-semibold uppercase text-white disabled:opacity-60"
            >
              {isSubmitting ? "Saving…" : "Save changes"}
            </button>
          </form>
        )}
      </Formik>
    </div>
  );
}

