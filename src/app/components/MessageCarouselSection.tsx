"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

const TABLE = "rsvps";

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

    const scrollerRef = useRef<HTMLDivElement | null>(null);

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
                .order("display_order", { ascending: true })
                .limit(12);

            if (!alive) return;

            if (error) {
                console.error("Message fetch error:", error.message);
                setRows([]);
                return;
            }

            setRows((data as Row[]) ?? []);
        })();

        return () => {
            alive = false;
        };
    }, []);

    // keep active dot synced with the card closest to center
    useEffect(() => {
        const el = scrollerRef.current;
        if (!el) return;

        let raf = 0;

        const updateActive = () => {
            const cards = Array.from(el.querySelectorAll<HTMLElement>("[data-card]"));
            if (!cards.length) return;

            const viewportCenter = el.scrollLeft + el.clientWidth / 2;

            let nearestIndex = 0;
            let nearestDistance = Infinity;

            cards.forEach((card, i) => {
                const cardCenter = card.offsetLeft + card.offsetWidth / 2;
                const distance = Math.abs(viewportCenter - cardCenter);

                if (distance < nearestDistance) {
                    nearestDistance = distance;
                    nearestIndex = i;
                }
            });

            setIdx((prev) => (prev === nearestIndex ? prev : nearestIndex));
        };

        const onScroll = () => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(updateActive);
        };

        updateActive();
        el.addEventListener("scroll", onScroll, { passive: true });

        return () => {
            cancelAnimationFrame(raf);
            el.removeEventListener("scroll", onScroll);
        };
    }, [items.length]);

    function goTo(nextIndex: number) {
        const el = scrollerRef.current;
        if (!el || items.length === 0) return;

        const clamped = Math.max(0, Math.min(nextIndex, items.length - 1));
        const cards = Array.from(el.querySelectorAll<HTMLElement>("[data-card]"));
        const target = cards[clamped];
        if (!target) return;

        const left =
            target.offsetLeft - (el.clientWidth - target.offsetWidth) / 2;

        el.scrollTo({
            left: Math.max(0, left),
            behavior: "smooth",
        });
    }

    if (items.length === 0) return null;

    return (
        <section className="mt-10">
            <div className="rounded-[28px] border border-white/55 bg-white/65 p-6 shadow-[0_20px_70px_rgba(0,0,0,0.10)] sm:p-10">
                <div className="text-center">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[#7A0022]/80">
                        Messages
                    </p>
                    <h2 className="mt-2 font-serif text-3xl font-semibold text-zinc-900">
                        Wishes
                    </h2>
                    <p className="mt-2 text-sm text-zinc-600">
                        Thank you for the kind words.
                    </p>
                </div>

                <div className="relative mt-8">
                    {items.length > 1 && (
                        <>
                            <button
                                type="button"
                                onClick={() => goTo(idx - 1)}
                                className="absolute -left-3 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white/80 backdrop-blur hover:bg-white md:inline-flex"
                                aria-label="Previous message"
                            >
                                <ChevronLeft />
                            </button>

                            <button
                                type="button"
                                onClick={() => goTo(idx + 1)}
                                className="absolute -right-3 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white/80 backdrop-blur hover:bg-white md:inline-flex"
                                aria-label="Next message"
                            >
                                <ChevronRight />
                            </button>
                        </>
                    )}

                    <div
                        ref={scrollerRef}
                        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 px-[6%] sm:px-[10%] md:px-0"
                        style={{
                            WebkitOverflowScrolling: "touch",
                            scrollbarWidth: "none",
                        }}
                    >
                        <style jsx>{`
              div::-webkit-scrollbar {
                display: none;
              }
            `}</style>

                        {items.map((it) => (
                            <article
                                key={it.id}
                                data-card
                                className="w-[110%] shrink-0 snap-center rounded-[26px] border border-black/10 bg-white/80 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.07)] backdrop-blur sm:w-[70%] md:w-[520px]"
                            >
                                <header className="flex items-start gap-3">
                                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-black/10 bg-[#FBF7F2] text-xs font-semibold tracking-[0.20em] text-[#7A0022]">
                                        {it.initials}
                                    </div>

                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-zinc-900">
                                            {it.name}
                                        </p>
                                        <p className="text-xs text-zinc-500">
                                            {formatDate(it.createdAt)}
                                        </p>
                                    </div>
                                </header>

                                <div className="mt-5">
                                    <p className="text-[16px] leading-relaxed text-zinc-800">
                                        “{trimTo(it.message, 260)}”
                                    </p>
                                </div>
                            </article>
                        ))}
                    </div>

                    {items.length > 1 && (
                        <div className="mt-5 flex items-center justify-center gap-2">
                            {items.map((it, i) => (
                                <button
                                    key={it.id}
                                    onClick={() => goTo(i)}
                                    className={[
                                        "h-2.5 rounded-full transition",
                                        i === idx
                                            ? "w-6 bg-[#7A0022]/70"
                                            : "w-2.5 bg-zinc-900/15 hover:bg-zinc-900/25",
                                    ].join(" ")}
                                    aria-label={`Go to message ${i + 1}`}
                                />
                            ))}
                        </div>
                    )}
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

function formatDate(iso: string) {
    try {
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return "";
        return d.toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "2-digit",
        });
    } catch {
        return "";
    }
}

function initialsFromName(name: string) {
    const parts = name
        .split(" ")
        .map((p) => p.trim())
        .filter(Boolean);

    const a = parts[0]?.[0]?.toUpperCase() ?? "G";
    const b =
        parts.length > 1 ? parts[parts.length - 1]?.[0]?.toUpperCase() : "";

    return (a + b).slice(0, 2);
}

function ChevronLeft() {
    return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
            <path
                d="M15 18l-6-6 6-6"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function ChevronRight() {
    return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
            <path
                d="M9 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}