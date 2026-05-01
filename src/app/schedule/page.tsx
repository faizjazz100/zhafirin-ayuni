"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import FloralBackground from "@/src/app/components/FloralBackground";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ScheduleItem } from "@/lib/schedule";
import { alexBrush } from "@/lib/fonts";

export default function SchedulePage() {
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("schedule")
      .select("*")
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        if (!cancelled) { setItems(data ?? []); setLoading(false); }
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <main className="min-h-screen text-zinc-800 selection:bg-[#7A0022]/15">
      <FloralBackground />

      {/* Background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(1200px_800px_at_10%_10%,rgba(122,0,34,0.08),transparent_60%),radial-gradient(900px_700px_at_90%_20%,rgba(176,16,62,0.07),transparent_55%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#FBF7F2] via-[#FBF7F2] to-white" />
      </div>

      <div className="mx-auto max-w-2xl px-5 pb-20 pt-16 sm:px-6 sm:pt-24">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="mb-12 text-center"
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.52em] text-[#7A0022]/70">
            Event Schedule
          </p>

          <h1 className={`${alexBrush.className} mt-2 text-[clamp(2.6rem,8vw,4rem)] leading-tight text-zinc-900`}>
            Wedding Day
          </h1>

          <div className="mx-auto mt-3 flex items-center justify-center gap-3">
            <div className="h-px w-10 bg-[#7A0022]/15" />
            <div className="h-1 w-1 rotate-45 bg-[#7A0022]/30" />
            <div className="h-px w-10 bg-[#7A0022]/15" />
          </div>

          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.36em] text-zinc-600">
            2 May 2026&nbsp;&nbsp;·&nbsp;&nbsp;Saturday
          </p>
          <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-400">
            Hacienda A-Park, Puchong
          </p>
          <p className="mt-3 text-xs text-zinc-400">Times are approximate.</p>
        </motion.div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
          className="overflow-hidden rounded-[28px] border border-white/60 bg-white shadow-[0_32px_80px_rgba(0,0,0,0.12),0_0_0_1px_rgba(122,0,34,0.05)] px-7 py-8 sm:px-10 sm:py-10"
        >
          {loading ? (
            <SkeletonTimeline />
          ) : (
            <Timeline items={items} />
          )}
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center"
        >
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white/85 px-6 py-3 text-sm font-medium text-zinc-900 backdrop-blur transition hover:bg-white"
          >
            ← Back to Home
          </Link>
        </motion.div>

      </div>
    </main>
  );
}

function Timeline({ items }: { items: ScheduleItem[] }) {
  return (
    <div>
      {items.map((item, i) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
          className="flex items-start"
        >
          {/* Time column */}
          <div className="w-24 shrink-0 pr-5 pt-0.75 text-right sm:w-28">
            <time className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#7A0022] leading-none">
              {item.time}
            </time>
          </div>

          {/* Content — border-left acts as the connector line */}
          <div className={`relative min-w-0 flex-1 pl-5 ${i < items.length - 1 ? "pb-7 border-l border-[#7A0022]/12" : "pb-1 border-l border-transparent"}`}>
            {/* Dot sits on the border */}
            <div className="absolute -left-[4.5px] top-0.75 h-2.5 w-2.5 rounded-full bg-[#7A0022]/60 ring-[3px] ring-[#7A0022]/12" />
            <p className="whitespace-nowrap text-[13px] font-semibold leading-snug text-zinc-800 sm:text-sm">
              {item.title}
            </p>
            {item.details?.length ? (
              <ul className="mt-2 space-y-1">
                {item.details.map((d) => (
                  <li key={d} className="text-[12px] leading-relaxed text-zinc-500 sm:text-[13px]">
                    {d}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function SkeletonTimeline() {
  return (
    <div className="space-y-0">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-start gap-0">
          <div className="w-24 shrink-0 pr-5 pt-1 text-right sm:w-28">
            <div className="ml-auto h-3 w-14 animate-pulse rounded-full bg-zinc-100" />
          </div>
          <div className="relative flex-1 pl-5 space-y-2">
            <div className="h-3 w-40 animate-pulse rounded-full bg-zinc-100" />
            <div className="h-2.5 w-28 animate-pulse rounded-full bg-zinc-50" />
          </div>
        </div>
      ))}
    </div>
  );
}
