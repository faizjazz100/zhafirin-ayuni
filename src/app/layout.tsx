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
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Put your global event name here:
  const COUPLE = "Ayuni & Zhafirin";
  const monogram = monogramFromCouple(COUPLE);

  return (
    <html lang="en">
      <body className="bg-[#FBF7F2] text-zinc-900">
        <Navbar monogram={monogram} rsvpHref="/rsvp" />
        {children}
      </body>
    </html>
  );
}