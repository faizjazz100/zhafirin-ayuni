import { Alex_Brush, Cormorant_Garamond } from "next/font/google";

export const alexBrush = Alex_Brush({
  subsets: ["latin"],
  weight: ["400"],
});

export const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-serif",
});
