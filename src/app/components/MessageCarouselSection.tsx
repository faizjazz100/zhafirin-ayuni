"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { supabase } from "@/lib/supabase";

const TABLE = "rsvps"; // change to your real table name

type Row = {
    id: string;
    full_name: string | null;
    message: string | null;
    created_at: string;
    show_message: boolean | null;
};

export default function MessageCarouselSection() {
    const [rows, setRows] = useState<Row[]>([]);
    const [idx, setIdx] = useState(0);
    const dragging = useRef(false);

    // hooks must be unconditional
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-160, 0, 160], [-2.5, 0, 2.5]);

    const items = useMemo(() => {
        return (rows ?? [])
            .filter((r) => (r.message ?? "").trim().length > 0)
            .map((r) => ({
                id: r.id,
                name: r.full_name?.trim() || "Guest",
                message: (r.message ?? "").trim(),
                createdAt: r.created_at,
            }));
    }, [rows]);

    useEffect(() => {
        let alive = true;

        async function load() {
            const { data, error } = await supabase
                .from(TABLE)
                .select("id, full_name, message, created_at, show_message")
                .eq("show_message", true)
                .not("message", "is", null)
                .order("created_at", { ascending: false })
                .limit(30);

            if (!alive) return;

            if (error) {
                console.error("Message fetch error:", error.message);
                setRows([]);
                return;
            }

            setRows((data as Row[]) ?? []);
        }

        load();
        return () => {
            alive = false;
        };
    }, []);

    useEffect(() => {
        if (items.length <= 1) return;
        const t = setInterval(() => {
            if (!dragging.current) setIdx((v) => (v + 1) % items.length);
        }, 4500);
        return () => clearInterval(t);
    }, [items.length]);

    useEffect(() => {
        if (idx >= items.length) setIdx(0);
    }, [idx, items.length]);

    if (items.length === 0) return null;

    const current = items[idx];

    const go = (next: number) => {
        const total = items.length;
        if (total === 0) return;
        setIdx((next + total) % total);
        x.set(0);
    };

    return (
        <section className="mt-8">
            {/* match your SectionCard style */}
            <div className="rounded-[28px] border border-white/40 bg-white/65 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur-xl sm:p-10">
                <div className="text-center">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-zinc-600">
                        Messages
                    </p>
                    <h2 className="mt-2 font-serif text-3xl font-semibold text-zinc-900">
                        Wishes
                    </h2>
                    <p className="mt-2 text-sm text-zinc-600">
                        Thank you for the kind words.
                    </p>
                </div>

                {/* tighter frame */}
                <div className="mt-8 flex justify-center">
                    <div className="w-full max-w-2xl">
                        <motion.div
                            className="rounded-[24px] border border-black/10 bg-white/70 p-6 shadow-sm backdrop-blur sm:p-8"
                            style={{ x, rotate }}
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={0.12}
                            onDragStart={() => {
                                dragging.current = true;
                            }}
                            onDragEnd={(_, info) => {
                                dragging.current = false;

                                const swipe = info.offset.x;
                                const velocity = info.velocity.x;

                                if (swipe < -80 || velocity < -500) return go(idx + 1);
                                if (swipe > 80 || velocity > 500) return go(idx - 1);

                                x.set(0);
                            }}
                        >
                            <div className="flex items-start gap-3">
                                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-black/10 bg-white/80">
                                    <span className="text-sm">✉️</span>
                                </div>

                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-zinc-900">
                                        {current.name}
                                    </p>
                                    <p className="text-xs text-zinc-500">
                                        {new Date(current.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            <p className="mt-5 text-[17px] leading-relaxed text-zinc-800">
                                “{trimTo(current.message, 220)}”
                            </p>
                        </motion.div>

                        {/* dots */}
                        <div className="mt-4 flex items-center justify-center gap-2">
                            {items.slice(0, 7).map((it, i) => (
                                <button
                                    key={it.id}
                                    onClick={() => go(i)}
                                    className={[
                                        "h-2 w-2 rounded-full transition",
                                        i === idx ? "bg-zinc-900/70" : "bg-zinc-900/20 hover:bg-zinc-900/35",
                                    ].join(" ")}
                                    aria-label={`Go to message ${i + 1}`}
                                />
                            ))}
                            {items.length > 7 ? (
                                <span className="ml-1 text-xs text-zinc-500">…</span>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function trimTo(text: string, max: number) {
    const t = (text ?? "").trim();
    if (t.length <= max) return t;
    return t.slice(0, max).trim() + "...";
}
