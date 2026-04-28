"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { ScheduleItem } from "@/lib/schedule";

export default function SchedulePreview() {
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("schedule")
      .select("*")
      .eq("show_in_preview", true)
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        if (!cancelled) { setItems(data ?? []); setLoading(false); }
      });
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="divide-y divide-black/5 pt-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-0 py-2.5 first:pt-0">
            <div className="w-20 shrink-0 pr-4 text-right">
              <div className="ml-auto h-2.5 w-12 animate-pulse rounded-full bg-zinc-100" />
            </div>
            <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-200 animate-pulse" />
            <div className="pl-3">
              <div className="h-2.5 w-36 animate-pulse rounded-full bg-zinc-100" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!items.length) return null;

  return (
    <div className="divide-y divide-black/5 pt-2">
      {items.map((item, i) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, x: -6 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.4, delay: i * 0.05, ease: "easeOut" }}
          className="flex items-center gap-0 py-2.5 first:pt-0"
        >
          {/* Time */}
          <div className="w-20 shrink-0 pr-4 text-right">
            <time className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#7A0022] leading-none">
              {item.time}
            </time>
          </div>

          {/* Dot */}
          <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#7A0022]/50" />

          {/* Title */}
          <div className="min-w-0 pl-3">
            <p className="text-[13px] font-semibold leading-none text-zinc-800">
              {item.title}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
