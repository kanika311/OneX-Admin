import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "1X Admin CRM",
  description: "Admin panel for 1X · Dr. Ayxh",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
