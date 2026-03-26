import { Suspense } from "react";
import type { Metadata } from "next";
import "./globals.css";

import Navbar from "@/src/app/components/Navbar";

export const metadata: Metadata = {
  title: "Ayuni & Zhafirin",
  description: "Wedding invitation",
};

function monogramFromCouple(couple: string) {
  const parts = couple.split("&").map((s) => s.trim()).filter(Boolean);
  const a = parts[0]?.[0]?.toUpperCase() ?? "";
  const b = parts[1]?.[0]?.toUpperCase() ?? "";
  return a && b ? `${a} & ${b}` : couple;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const COUPLE = "Ayuni & Zhafirin";
  const monogram = monogramFromCouple(COUPLE);

  return (
    <html lang="en">
      <body className="bg-[#FBF7F2] text-zinc-900">

        {/* ✅ FIX HERE */}
        <Suspense fallback={null}>
          <Navbar monogram={monogram} rsvpHref="/rsvp" />
        </Suspense>

        {children}
      </body>
    </html>
  );
}