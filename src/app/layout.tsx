import { Suspense } from "react";
import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/src/app/components/Navbar";
import { cormorant } from "@/lib/fonts";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

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
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className={`${cormorant.variable} bg-[#FBF7F2] text-zinc-900`}>

        {/* ✅ FIX HERE */}
        <Suspense fallback={null}>
          <Navbar monogram={monogram} rsvpHref="/rsvp" />
        </Suspense>

        {children}
      </body>
    </html>
  );
}