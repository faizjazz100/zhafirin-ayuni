"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import FloralBackground from "@/src/app/components/FloralBackground";
import SessionLookup from "./SessionLookup";

const SESSION_INFO = [
  { label: "Session 1", time: "3:00 PM – 4:30 PM" },
  { label: "Session 2", time: "4:30 PM – 5:30 PM" },
  { label: "Session 3", time: "5:30 PM – 8:00 PM" },
];

export default function SessionPage() {
  return (
    <main className="min-h-screen text-zinc-800 selection:bg-[#7A0022]/15">
      <FloralBackground />

      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(1200px_800px_at_10%_10%,rgba(122,0,34,0.08),transparent_60%),radial-gradient(900px_700px_at_90%_20%,rgba(176,16,62,0.07),transparent_55%)]" />
        <div className="absolute inset-0 bg-linear-to-b from-[#FBF7F2] via-[#FBF7F2] to-white" />
      </div>

      <div className="mx-auto max-w-xl px-5 pb-20 pt-16 sm:px-6 sm:pt-24">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="mb-10 text-center"
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.52em] text-[#7A0022]/70">
            Session
          </p>
          <h1 className="mt-2 font-serif text-4xl font-semibold text-zinc-900 sm:text-5xl">
            Find Your Session
          </h1>
          <div className="mx-auto mt-3 flex items-center justify-center gap-3">
            <div className="h-px w-10 bg-[#7A0022]/15" />
            <div className="h-1 w-1 rotate-45 bg-[#7A0022]/30" />
            <div className="h-px w-10 bg-[#7A0022]/15" />
          </div>
          <p className="mt-3 text-sm text-zinc-500">
            Enter your phone number to check which session you&apos;re assigned to.
          </p>
        </motion.div>

        {/* Session times card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="overflow-hidden rounded-[28px] border border-white/60 bg-white px-7 py-7 shadow-[0_32px_80px_rgba(0,0,0,0.12),0_0_0_1px_rgba(122,0,34,0.05)] sm:px-10 sm:py-8"
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-[#7A0022]/70">
            Session Times
          </p>
          <div className="mt-4 flex flex-col gap-2.5">
            {SESSION_INFO.map((s) => (
              <div
                key={s.label}
                className="flex items-center justify-between rounded-2xl border border-black/6 bg-[#FDFCFB] px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-[#7A0022]/40" />
                  <span className="text-sm font-semibold text-zinc-800">{s.label}</span>
                </div>
                <span className="font-mono text-[13px] font-semibold text-[#7A0022]">{s.time}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Lookup card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mt-6 overflow-hidden rounded-[28px] border border-white/60 bg-white px-7 py-7 shadow-[0_32px_80px_rgba(0,0,0,0.12),0_0_0_1px_rgba(122,0,34,0.05)] sm:px-10 sm:py-8"
        >
          <SessionLookup />
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
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
