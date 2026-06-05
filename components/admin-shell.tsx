"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { adminLogout, getStoredAdmin } from "@/lib/auth";
import Image from "next/image";

const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/products", label: "Services & Courses" },
  { href: "/dashboard/offers", label: "Gift cards" },
  { href: "/dashboard/site-content", label: "Contact & Legal" },
  { href: "/dashboard/customers", label: "Customers" },
  { href: "/dashboard/orders", label: "Orders" },
] as const;

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const admin = getStoredAdmin();

  return (
    <div className="flex min-h-dvh">
      <aside className="flex w-56 shrink-0 flex-col border-r border-rose-100 bg-white px-4 py-6">
        {/* <p className="font-serif text-lg text-ink">1X CRM</p> */}

        <Image
          src="/LOGO.jpeg"
          alt="Dr. Ayxh"
          width={48}
          height={48}
          className="h-12 w-12 rounded-full object-cover border border-rose-100"
          priority
        />
        <p className="text-xs text-muted">Dr. Ayxh Admin</p>
        <nav className="mt-8 flex flex-1 flex-col gap-1">
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
      <main className="flex-1 overflow-auto p-6 md:p-10">{children}</main>
    </div>
  );
}
