"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ScheduleItem } from "@/lib/schedule";

function InfoCard({ time, title }: { time: string; title: string }) {
    return (
        <div className="rounded-3xl border border-black/10 bg-white/75 px-6 py-5 shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
            <div className="grid grid-cols-[90px_1fr] items-start gap-4">
                <div className="whitespace-nowrap text-base font-semibold text-zinc-900">
                    {time}
                </div>
                <div className="min-w-0 text-right">
                    <p className="text-sm font-semibold leading-snug text-zinc-800">
                        {title}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function SchedulePreview() {
    const [items, setItems] = useState<ScheduleItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            const { data } = await supabase
                .from("schedule")
                .select("*")
                .eq("show_in_preview", true)
                .order("sort_order", { ascending: true });
            if (!cancelled) {
                setItems(data ?? []);
                setLoading(false);
            }
        }

        load();
        return () => { cancelled = true; };
    }, []);

    if (loading) {
        return (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className="h-[72px] animate-pulse rounded-3xl border border-black/10 bg-white/75"
                    />
                ))}
            </div>
        );
    }

    if (items.length === 0) {
        return <p className="mt-6 text-center text-sm text-zinc-400">No schedule items yet.</p>;
    }

    return (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
            {items.map((item) => (
                <InfoCard key={item.id} time={item.time} title={item.title} />
            ))}
        </div>
    );
}