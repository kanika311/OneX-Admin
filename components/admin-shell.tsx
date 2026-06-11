"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { adminLogout, getStoredAdmin } from "@/lib/auth";

const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/products", label: "Services & Courses" },
  { href: "/dashboard/offers", label: "Gift cards" },
  { href: "/dashboard/site-content", label: "Contact & Legal" },
  { href: "/dashboard/contact-inquiries", label: "Contact messages" },
  { href: "/dashboard/testimonials", label: "Testimonials" },
  { href: "/dashboard/customers", label: "Customers" },
  { href: "/dashboard/orders", label: "Orders" },
] as const;

function MenuIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const admin = getStoredAdmin();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <div className="flex min-h-dvh">
      <header className="fixed inset-x-0 top-0 z-30 flex items-center gap-3 border-b border-rose-100 bg-white px-4 py-3 md:hidden">
        <button
          type="button"
          className="rounded-lg p-1.5 text-ink hover:bg-rose-50"
          aria-label="Open menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(true)}
        >
          <MenuIcon />
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/LOGO.jpeg"
          alt="Dr. Ayxh"
          width={32}
          height={32}
          className="h-8 w-8 rounded-full object-cover border border-rose-100"
        />
        <p className="text-sm font-medium text-ink">Dr. Ayxh Admin</p>
      </header>

      {menuOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 max-w-[85vw] flex-col border-r border-rose-100 bg-white px-4 py-6 transition-transform duration-200 ease-out md:static md:z-auto md:w-56 md:max-w-none md:shrink-0 md:translate-x-0 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/LOGO.jpeg"
              alt="Dr. Ayxh"
              width={48}
              height={48}
              className="h-12 w-12 rounded-full object-cover border border-rose-100"
            />
            <p className="mt-2 text-xs text-muted">Dr. Ayxh Admin</p>
          </div>
          <button
            type="button"
            className="rounded-lg p-1.5 text-ink hover:bg-rose-50 md:hidden"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          >
            <CloseIcon />
          </button>
        </div>

        <nav className="mt-8 flex flex-1 flex-col gap-1 overflow-y-auto">
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`rounded-lg px-3 py-2.5 text-sm font-medium ${
                pathname === href || pathname.startsWith(`${href}/`)
                  ? "bg-rose-50 text-mauve-deep"
                  : "text-muted hover:bg-rose-50 hover:text-ink"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-rose-100 pt-4 text-xs text-muted">
          <p className="truncate font-medium text-ink">{admin?.name}</p>
          <p className="truncate">{admin?.number}</p>
          <button
            type="button"
            className="mt-3 text-mauve-deep hover:underline"
            onClick={() => {
              adminLogout();
              router.replace("/login");
            }}
          >
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto p-4 pt-[4.25rem] md:p-10 md:pt-10">{children}</main>
    </div>
  );
}
