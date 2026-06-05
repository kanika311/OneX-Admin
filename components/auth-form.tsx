"use client";

import { Formik } from "formik";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import * as Yup from "yup";

import { adminLogin, adminRegister } from "@/lib/auth";

const inputClass =
  "mt-1 w-full rounded-lg border border-rose-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-mauve";

const phoneSchema = Yup.string()
  .required("Phone is required")
  .test("phone", "Enter a valid 10-digit phone number", (value) => {
    const digits = (value || "").replace(/\D/g, "");
    return digits.length >= 10 && digits.length <= 15;
  });

type Props = { mode: "login" | "register" };

export function AuthForm({ mode }: Props) {
  const router = useRouter();
  const [error, setError] = useState("");

  const schema =
    mode === "login"
      ? Yup.object({ number: phoneSchema, password: Yup.string().min(6).required() })
      : Yup.object({
          name: Yup.string().min(2).required(),
          number: phoneSchema,
          password: Yup.string().min(6).required(),
          adminSecret: Yup.string().required("Admin secret required"),
        });

  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-rose-100 bg-white p-8 shadow-lg">
        <h1 className="text-center font-serif text-2xl text-ink">
          {mode === "login" ? "Admin sign in" : "Create admin account"}
        </h1>
        <p className="mt-2 text-center text-sm text-muted">1X · Dr. Ayxh CRM</p>

        <Formik
          initialValues={
            mode === "login"
              ? { number: "", password: "" }
              : { name: "", number: "", password: "", adminSecret: "" }
          }
          validationSchema={schema}
          onSubmit={async (values, { setSubmitting }) => {
            setError("");
            try {
              if (mode === "login") {
                await adminLogin(values.number, values.password);
              } else {
                const v = values as { name: string; number: string; password: string; adminSecret: string };
                await adminRegister(
                  v.name,
                  v.number,
                  v.password,
                  v.adminSecret || process.env.NEXT_PUBLIC_ADMIN_REGISTER_SECRET || "",
                );
              }
              router.replace("/dashboard");
            } catch (e) {
              const msg = e instanceof Error ? e.message : "Authentication failed";
              setError(msg.includes("fetch") ? "Cannot reach API. Run onex-api on port 5000." : msg);
              setSubmitting(false);
            }
          }}
        >
          {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              {mode === "register" ? (
                <div>
                  <label className="text-xs font-semibold uppercase text-muted">Name</label>
                  <input name="name" className={inputClass} value={values.name} onChange={handleChange} onBlur={handleBlur} />
                  {touched.name && errors.name ? <p className="mt-1 text-xs text-red-500">{errors.name}</p> : null}
                </div>
              ) : null}
              <div>
                <label className="text-xs font-semibold uppercase text-muted">Phone number</label>
                <input
                  name="number"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder="10-digit mobile number"
                  className={inputClass}
                  value={values.number}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {touched.number && errors.number ? (
                  <p className="mt-1 text-xs text-red-500">{String(errors.number)}</p>
                ) : null}
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-muted">Password</label>
                <input
                  name="password"
                  type="password"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  className={inputClass}
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {touched.password && errors.password ? (
                  <p className="mt-1 text-xs text-red-500">{errors.password}</p>
                ) : null}
              </div>
              {mode === "register" ? (
                <div>
                  <label className="text-xs font-semibold uppercase text-muted">Admin secret</label>
                  <input
                    name="adminSecret"
                    type="password"
                    className={inputClass}
                    value={values.adminSecret}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {touched.adminSecret && errors.adminSecret ? (
                    <p className="mt-1 text-xs text-red-500">{errors.adminSecret}</p>
                  ) : null}
                </div>
              ) : null}
              {error ? <p className="text-sm text-red-500">{error}</p> : null}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-lg bg-mauve-deep py-3 text-sm font-semibold uppercase text-white disabled:opacity-60"
              >
                {isSubmitting ? "Please wait…" : mode === "login" ? "Sign in" : "Register"}
              </button>
            </form>
          )}
        </Formik>

        <p className="mt-6 text-center text-sm text-muted">
          {mode === "login" ? (
            <>
              No account? <Link href="/register" className="font-medium text-mauve-deep hover:underline">Register</Link>
            </>
          ) : (
            <>
              Have an account? <Link href="/login" className="font-medium text-mauve-deep hover:underline">Sign in</Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
