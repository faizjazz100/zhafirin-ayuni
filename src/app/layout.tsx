import { Suspense } from "react";
import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/src/app/components/Navbar";

export const metadata: Metadata = {
  title: "Zhafirin & Ayuni",
  description: "Wedding invitation",
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const monogram = "A TO Z";

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