"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import FloralCorner2 from "@/src/app/components/FloralCorner2";

const TABLE = "rsvps";
const AUTO_ADVANCE_MS = 5000;

type Row = {
    id: string;
    full_name: string | null;
    message: string | null;
    created_at: string;
    show_message: boolean | null;
    display_order: number | null;
};

type Item = {
    id: string;
    name: string;
    message: string;
    createdAt: string;
    initials: string;
};

export default function MessageCarouselSection() {
    const [rows, setRows] = useState<Row[]>([]);
    const [idx, setIdx] = useState(0);
    const [paused, setPaused] = useState(false);
    const scrollerRef = useRef<HTMLDivElement | null>(null);
    const idxRef = useRef(idx);
    idxRef.current = idx;

    const items = useMemo<Item[]>(() => {
        return (rows ?? [])
            .filter((r) => (r.message ?? "").trim().length > 0)
            .map((r) => {
                const name = r.full_name?.trim() || "Guest";
                return {
                    id: r.id,
                    name,
                    message: (r.message ?? "").trim(),
                    createdAt: r.created_at,
                    initials: initialsFromName(name),
                };
            });
    }, [rows]);

    useEffect(() => {
        let alive = true;
        (async () => {
            const { data, error } = await supabase
                .from(TABLE)
                .select("id, full_name, message, created_at, show_message, display_order")
                .eq("show_message", true)
                .not("message", "is", null)
                .order("created_at", { ascending: false })
                .limit(12);
            if (!alive) return;
            if (error) { setRows([]); return; }
            setRows((data as Row[]) ?? []);
        })();
        return () => { alive = false; };
    }, []);

    const goTo = useCallback((nextIndex: number) => {
        const el = scrollerRef.current;
        if (!el || items.length === 0) return;
        const clamped = Math.max(0, Math.min(nextIndex, items.length - 1));
        const cards = Array.from(el.querySelectorAll<HTMLElement>("[data-card]"));
        const target = cards[clamped];
        if (!target) return;
        el.scrollTo({
            left: Math.max(0, target.offsetLeft - (el.clientWidth - target.offsetWidth) / 2),
            behavior: "smooth",
        });
    }, [items.length]);

    // Sync active dot with scroll position
    useEffect(() => {
        const el = scrollerRef.current;
        if (!el) return;
        let raf = 0;
        const update = () => {
            const cards = Array.from(el.querySelectorAll<HTMLElement>("[data-card]"));
            if (!cards.length) return;
            const center = el.scrollLeft + el.clientWidth / 2;
            let nearest = 0, minDist = Infinity;
            cards.forEach((c, i) => {
                const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - center);
                if (d < minDist) { minDist = d; nearest = i; }
            });
            setIdx((p) => p === nearest ? p : nearest);
        };
        const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); };
        update();
        el.addEventListener("scroll", onScroll, { passive: true });
        return () => { cancelAnimationFrame(raf); el.removeEventListener("scroll", onScroll); };
    }, [items.length]);

    // Auto-advance
    useEffect(() => {
        if (items.length <= 1 || paused) return;
        const timer = setInterval(() => {
            const next = (idxRef.current + 1) % items.length;
            goTo(next);
        }, AUTO_ADVANCE_MS);
        return () => clearInterval(timer);
    }, [items.length, paused, goTo]);

    if (items.length === 0) return null;

    return (
        <section className="relative mt-10">
            <FloralCorner2 position="top-right" />
            <FloralCorner2 position="top-left" className="opacity-70" />

            <div className="overflow-hidden rounded-[32px] border border-white/60 bg-white shadow-[0_32px_80px_rgba(0,0,0,0.18),0_0_0_1px_rgba(122,0,34,0.06)]">

                {/* Header */}
                <div className="px-8 pt-9 text-center sm:px-10">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-[#7A0022]/75">
                        Messages
                    </p>
                    <h2 className="mt-2 font-serif text-3xl font-semibold text-zinc-900">
                        Wishes
                    </h2>
                    <p className="mt-1.5 text-sm text-zinc-500">
                        Thank you for the kind words.
                    </p>
                </div>

                {/* Carousel */}
                <div
                    className="relative mt-7 pb-8"
                    onMouseEnter={() => setPaused(true)}
                    onMouseLeave={() => setPaused(false)}
                    onTouchStart={() => setPaused(true)}
                    onTouchEnd={() => setPaused(false)}
                >
                    {/* Fade edges */}
                    <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-white to-transparent" />
                    <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-white to-transparent" />

                    {/* Arrow buttons */}
                    {items.length > 1 && (
                        <>
                            <button
                                type="button"
                                onClick={() => { setPaused(true); goTo(idx - 1); }}
                                className="absolute -left-1 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-black/8 bg-white shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition hover:border-[#7A0022]/20 hover:shadow-[0_4px_20px_rgba(122,0,34,0.12)] md:inline-flex"
                                aria-label="Previous message"
                            >
                                <ChevronLeft />
                            </button>
                            <button
                                type="button"
                                onClick={() => { setPaused(true); goTo(idx + 1); }}
                                className="absolute -right-1 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-black/8 bg-white shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition hover:border-[#7A0022]/20 hover:shadow-[0_4px_20px_rgba(122,0,34,0.12)] md:inline-flex"
                                aria-label="Next message"
                            >
                                <ChevronRight />
                            </button>
                        </>
                    )}

                    {/* Scroll track */}
                    <div
                        ref={scrollerRef}
                        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-[8%] pb-2 sm:px-[12%] md:px-16"
                        style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}
                    >
                        <style jsx>{`div::-webkit-scrollbar { display: none; }`}</style>

                        {items.map((it) => (
                            <article
                                key={it.id}
                                data-card
                                className="w-[78vw] max-w-sm shrink-0 snap-center rounded-[24px] border border-black/6 bg-[#FDFCFB] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.07)] sm:w-[60%] sm:p-6 md:w-full"
                            >
                                {/* Author — top */}
                                <header className="flex items-center gap-3">
                                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#7A0022] to-[#B0103E] text-[11px] font-semibold tracking-wide text-white shadow-[0_4px_12px_rgba(122,0,34,0.25)]">
                                        {it.initials}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-zinc-900">{it.name}</p>
                                        <p className="text-xs text-zinc-400">{formatDate(it.createdAt)}</p>
                                    </div>
                                </header>

                                {/* Divider */}
                                <div className="mt-4 h-px w-full bg-black/5" />

                                {/* Quote mark + Message */}
                                <div className="mt-3">
                                    <QuoteMark />
                                    <p className="mt-2 text-[14px] leading-[1.75] text-zinc-700 sm:text-[15px]">
                                        {trimTo(it.message, 220)}
                                    </p>
                                </div>
                            </article>
                        ))}
                    </div>

                    {/* Dot indicators */}
                    {items.length > 1 && (
                        <div className="mt-5 flex items-center justify-center gap-2">
                            {items.map((it, i) => (
                                <button
                                    key={it.id}
                                    onClick={() => { setPaused(true); goTo(i); }}
                                    aria-label={`Go to message ${i + 1}`}
                                    className={[
                                        "h-1.5 rounded-full transition-all duration-300",
                                        i === idx ? "w-6 bg-[#7A0022]" : "w-1.5 bg-zinc-300 hover:bg-zinc-400",
                                    ].join(" ")}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

function QuoteMark() {
    return (
        <svg viewBox="0 0 36 28" className="h-6 w-8 text-[#7A0022]/18" fill="currentColor" aria-hidden="true">
            <path d="M0 28V16.8C0 7.467 5.6 1.867 16.8 0L18.667 2.8C12.444 4.356 9.333 7.778 9.333 11.2H16.8V28H0ZM19.2 28V16.8C19.2 7.467 24.8 1.867 36 0L37.867 2.8C31.644 4.356 28.533 7.778 28.533 11.2H36V28H19.2Z" />
        </svg>
    );
}

function trimTo(text: string, max: number) {
    const t = (text ?? "").trim();
    return t.length <= max ? t : t.slice(0, max).trim() + "…";
}

function formatDate(iso: string) {
    try {
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return "";
        return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
    } catch { return ""; }
}

function initialsFromName(name: string) {
    const parts = name.split(" ").map((p) => p.trim()).filter(Boolean);
    const a = parts[0]?.[0]?.toUpperCase() ?? "G";
    const b = parts.length > 1 ? parts[parts.length - 1]?.[0]?.toUpperCase() : "";
    return (a + b).slice(0, 2);
}

function ChevronLeft() {
    return (
        <svg viewBox="0 0 24 24" className="h-4 w-4 text-zinc-500" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
        </svg>
    );
}

function ChevronRight() {
    return (
        <svg viewBox="0 0 24 24" className="h-4 w-4 text-zinc-500" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 6l6 6-6 6" />
        </svg>
    );
}
