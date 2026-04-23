"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import PageContainer from "@/src/app/components/PageContainer";
import FloralBackground from "@/src/app/components/FloralBackground";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ScheduleItem } from "@/lib/schedule";

export default function SchedulePage() {
    const [items, setItems] = useState<ScheduleItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            setLoading(true);
            const { data } = await supabase
                .from("schedule")
                .select("*")
                .order("sort_order", { ascending: true });
            if (!cancelled) {
                setItems(data ?? []);
                setLoading(false);
            }
        }

        load();
        return () => { cancelled = true; };
    }, []);

    return (
        <main className="min-h-screen text-zinc-800">
            <FloralBackground />
            <div className="pointer-events-none fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-[radial-gradient(1200px_800px_at_10%_10%,rgba(122,0,34,0.10),transparent_60%),radial-gradient(900px_700px_at_90%_20%,rgba(176,16,62,0.08),transparent_55%),radial-gradient(900px_700px_at_50%_100%,rgba(0,0,0,0.06),transparent_60%)]" />
                <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-[#FBF7F2]/55 to-white/80" />
            </div>

            <PageContainer floral>
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                    className="rounded-[28px] border border-white/55 bg-white/65 p-6 shadow-[0_20px_70px_rgba(0,0,0,0.10)] sm:p-10"
                >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[#7A0022]/80">
                        Event Schedule
                    </p>
                    <h1 className="mt-2 font-serif text-4xl font-semibold text-zinc-900 sm:text-5xl">
                        Tentative
                    </h1>
                    <p className="mt-3 text-sm text-zinc-600">
                        Timeline for the ceremony. Times are approximate.
                    </p>

                    <div className="mt-8 space-y-3">
                        {loading ? (
                            <div className="py-16 text-center text-sm text-zinc-400">Loading…</div>
                        ) : (
                            items.map((it, i) => (
                                <motion.div
                                    key={it.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-80px" }}
                                    transition={{ duration: 0.4, delay: Math.min(i * 0.03, 0.18) }}
                                    className="rounded-3xl border border-black/10 bg-white/75 px-6 py-5 shadow-[0_10px_30px_rgba(0,0,0,0.06)]"
                                >
                                    <div className="grid grid-cols-[88px_minmax(0,1fr)] items-start gap-4 sm:grid-cols-[110px_minmax(0,1fr)]">
                                        <div className="whitespace-nowrap text-base font-semibold text-zinc-900 sm:text-lg">
                                            {it.time}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-sm font-semibold leading-snug text-zinc-800 sm:text-base">
                                                {it.title}
                                            </div>
                                            {it.details?.length ? (
                                                <ul className="mt-2 space-y-1 text-sm text-zinc-700">
                                                    {it.details.map((d) => (
                                                        <li key={d} className="leading-relaxed">• {d}</li>
                                                    ))}
                                                </ul>
                                            ) : null}
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>

                    <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
                        <Link
                            href="/"
                            className="inline-flex items-center justify-center rounded-2xl border border-black/10 bg-white/85 px-5 py-3 text-sm text-zinc-900 hover:bg-white"
                        >
                            Back to Home
                        </Link>
                        <Link
                            href="/rsvp"
                            className="inline-flex items-center justify-center rounded-2xl bg-[#7A0022] px-5 py-3 text-sm font-medium text-white shadow-[0_12px_26px_rgba(122,0,34,0.18)] hover:bg-[#64001C]"
                        >
                            RSVP
                        </Link>
                    </div>
                </motion.div>
            </PageContainer>
        </main>
    );
}