"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import FloralBackground from "@/src/app/components/FloralBackground";
import { alexBrush } from "@/lib/fonts";

// ─── Story chapters ───────────────────────────────────────────────────────────

const chapters = [
  {
    num: "I",
    heading: "First Crossings",
    body: `They met two years ago on the same working pathway, where their daily routines crossed without much thought. Both were focused on their careers, exchanging nothing more than brief greetings and occasional smiles, friendly acquaintances in a busy world.`,
  },
  {
    num: "II",
    heading: "Growing Closer",
    body: `Over time, casual hellos turned into conversations, then shared lunches, and eventually a steady friendship. They supported one another through work challenges and personal struggles, becoming a constant presence in each othes’s lives. Yet, quietly and unspoken, one of them wished for something more. A love that felt close, but still just out of reach.`,
  },
  {
    num: "III",
    heading: "A Whispered Prayer",
    body: `One evening, after a particularly difficult day, a heartfelt prayer was whispered. The wish was simple but sincere: to find someone who could be more than a friend, someone truly meant to stay. Unknowingly, the answer to that prayer had already been standing right beside them all along.`,
  },
  {
    num: "IV",
    heading: "Something More",
    body: `As the seasons changed, so did their feelings. What began as friendship slowly blossomed into love. Built on trust, understanding, and the comfort of truly knowing one another. The person who was once just a companion on the same working path became the most important part of their life, a blessing quietly granted by an answered prayer.`,
  },
  {
    num: "V",
    heading: "A Beautiful Beginning",
    body: `In the end, their love story was not shaped by grand gestures or sudden sparks, but by the gentle and steady growth of two hearts finding their way to each other, proving that sometimes, the most beautiful love stories begin as friendships and bloom when least expected.`,
  },
];

// ─── Ornamental divider ───────────────────────────────────────────────────────

function Ornament({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 140 20"
      className={`mx-auto h-4 w-32 text-[#7A0022]/28 ${className}`}
      fill="none"
      aria-hidden="true"
    >
      <line x1="0" y1="10" x2="52" y2="10" stroke="currentColor" strokeWidth="0.8" />
      <line x1="88" y1="10" x2="140" y2="10" stroke="currentColor" strokeWidth="0.8" />
      <circle cx="24" cy="10" r="1.8" fill="currentColor" fillOpacity="0.35" />
      <circle cx="116" cy="10" r="1.8" fill="currentColor" fillOpacity="0.35" />
      <circle cx="42" cy="10" r="1.2" fill="currentColor" fillOpacity="0.25" />
      <circle cx="98" cy="10" r="1.2" fill="currentColor" fillOpacity="0.25" />
      <ellipse cx="70" cy="10" rx="9" ry="3.5" fill="currentColor" fillOpacity="0.4" />
      <ellipse cx="70" cy="10" rx="4.5" ry="1.8" fill="currentColor" fillOpacity="0.55" />
      <circle cx="70" cy="10" r="1.8" fill="currentColor" />
    </svg>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OurStoryPage() {
  return (
    <main className="min-h-screen text-zinc-800 selection:bg-[#7A0022]/15">
      <FloralBackground />

      {/* Background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(1200px_800px_at_10%_10%,rgba(122,0,34,0.07),transparent_60%),radial-gradient(900px_700px_at_90%_20%,rgba(176,16,62,0.06),transparent_55%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#FBF7F2] via-[#FBF7F2] to-white" />
      </div>

      {/* ── Header ── */}
      <motion.header
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="pt-20 pb-10 text-center px-5 sm:pt-28 sm:pb-12"
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.52em] text-[#7A0022]/60">
          Our Story
        </p>

        <h1 className="mt-2 font-serif text-[clamp(2.4rem,8vw,4rem)] font-semibold leading-tight tracking-tight text-zinc-900">
          #ZHAFYUNI
        </h1>

        <div className="mx-auto mt-4 flex items-center justify-center gap-3">
          <div className="h-px w-10 bg-[#7A0022]/14" />
          <div className="h-[5px] w-[5px] rotate-45 bg-[#7A0022]/30" />
          <div className="h-px w-10 bg-[#7A0022]/14" />
        </div>

        <p className="mx-auto mt-4 max-w-[34ch] text-[13px] leading-relaxed text-zinc-500">
          A journey that began quietly, and grew into something beautiful.
        </p>
      </motion.header>

      {/* ── Hero photo ── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-xl px-5 sm:px-6"
      >
        <div className="relative overflow-hidden rounded-[24px] shadow-[0_24px_64px_rgba(0,0,0,0.13)]">
          <Image
            src="/couple.jpeg"
            alt="Zhafirin and Ayuni"
            width={900}
            height={600}
            className="w-full object-cover"
            priority
          />
          <div className="pointer-events-none absolute inset-0 rounded-[24px] ring-1 ring-inset ring-black/8" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/15 to-transparent" />
        </div>
        <p className="mt-2.5 text-center text-[11px] tracking-[0.22em] text-zinc-400">
          Zhafirin & Ayuni
        </p>
      </motion.div>

      {/* ── Story body ── */}
      <div className="mx-auto max-w-xl px-5 pb-24 pt-10 sm:px-6">

        {/* White card wrapping all story content */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.3, ease: "easeOut" }}
          className="overflow-hidden rounded-[28px] border border-white/60 bg-white px-7 py-9 shadow-[0_32px_80px_rgba(0,0,0,0.12),0_0_0_1px_rgba(122,0,34,0.05)] sm:px-10 sm:py-11"
        >

        {chapters.map((chapter, i) => (
          <motion.div
            key={chapter.num}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-70px" }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            {/* Pull quote — before chapter IV */}
            {i === 3 && (
              <figure className="mb-12 px-1 sm:px-4">
                <blockquote className="border-l-2 border-[#7A0022]/25 pl-5">
                  <p
                    className={`${alexBrush.className} text-[1.65rem] leading-snug text-[#7A0022]/75 sm:text-[2rem]`}
                  >
                    &quot;The answer to that prayer had already been standing right beside them all along.&quot;
                  </p>
                </blockquote>
              </figure>
            )}

            {/* Chapter */}
            <div className={i < chapters.length - 1 ? "mb-12" : "mb-8"}>
              <p className="text-[9px] font-semibold uppercase tracking-[0.5em] text-[#7A0022]/50">
                Chapter {chapter.num}
              </p>
              <h2 className="mt-1.5 font-serif text-xl font-semibold text-zinc-900 sm:text-2xl">
                {chapter.heading}
              </h2>
              <p className="mt-4 text-[15px] leading-[1.85] text-zinc-600">
                {chapter.body}
              </p>
            </div>

            {/* Ornamental divider between chapters */}
            {i < chapters.length - 1 && (
              <div className="mb-12">
                <Ornament />
              </div>
            )}
          </motion.div>
        ))}

        {/* Closing */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mt-4 mb-14 text-center"
        >
          <Ornament className="mb-5" />
          <p className="font-serif text-sm italic text-zinc-400">
            2 May 2026 · Hacienda A-Park, Puchong
          </p>
          <p
            className={`${alexBrush.className} mt-1 text-2xl text-[#7A0022]/60`}
          >
            #ZHAFYUNI
          </p>
        </motion.div>

        </motion.div> {/* end white card */}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center"
        >
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white/85 px-6 py-3 text-sm font-medium text-zinc-900 backdrop-blur transition hover:bg-white"
          >
            ← Back to Home
          </Link>
        </motion.div>

        <p className="mt-8 text-center text-xs text-zinc-400">
          © {new Date().getFullYear()} Zhafirin & Ayuni
        </p>

      </div>
    </main>
  );
}
