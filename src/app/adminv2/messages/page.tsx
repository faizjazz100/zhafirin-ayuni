"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type MsgFilter = "all" | "featured" | "hidden";

type MsgRow = {
    id: string;
    full_name: string | null;
    message: string | null;
    show_message: boolean | null;
    created_at: string;
    display_order: number | null;
};

export default function AdminMessagesPage() {
    const [rows, setRows] = useState<MsgRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState<MsgFilter>("all");
    const [savingId, setSavingId] = useState("");

    async function fetchMessages() {
        return await supabase
            .from("rsvps")
            .select("id, full_name, message, show_message, created_at, display_order")
            .not("message", "is", null)
            .order("display_order", { ascending: true })
            .order("created_at", { ascending: false })
            .limit(200);
    }

    async function load() {
        setLoading(true);
        setError("");
        const { data, error } = await fetchMessages();
        if (error) {
            setError(error.message);
            setRows([]);
            setLoading(false);
            return;
        }
        const cleaned = ((data ?? []) as MsgRow[]).filter(
            (r) => (r.message ?? "").trim().length > 0
        );
        setRows(cleaned);
        setLoading(false);
    }

    async function setFeatured(id: string, value: boolean) {
        setSavingId(id);
        setError("");
        const { error } = await supabase
            .from("rsvps")
            .update({ show_message: value })
            .eq("id", id);
        if (error) {
            setError(error.message);
            setSavingId("");
            return;
        }
        setRows((current) =>
            current.map((r) => (r.id === id ? { ...r, show_message: value } : r))
        );
        setSavingId("");
    }

    async function updateOrder(id: string, value: string) {
        const order = value.trim() === "" ? null : Number(value);
        if (value.trim() !== "" && Number.isNaN(order)) return;
        setSavingId(id);
        setError("");
        const { error } = await supabase
            .from("rsvps")
            .update({ display_order: order })
            .eq("id", id);
        if (error) {
            setError(error.message);
            setSavingId("");
            return;
        }
        setRows((current) =>
            [...current]
                .map((r) => (r.id === id ? { ...r, display_order: order } : r))
                .sort((a, b) => {
                    const aOrder = a.display_order ?? 999999;
                    const bOrder = b.display_order ?? 999999;
                    if (aOrder !== bOrder) return aOrder - bOrder;
                    return (
                        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                    );
                })
        );
        setSavingId("");
    }

    useEffect(() => {
        let cancelled = false;
        async function firstLoad() {
            const { data, error } = await fetchMessages();
            if (cancelled) return;
            if (error) {
                setError(error.message);
                setRows([]);
                setLoading(false);
                return;
            }
            const cleaned = ((data ?? []) as MsgRow[]).filter(
                (r) => (r.message ?? "").trim().length > 0
            );
            setRows(cleaned);
            setLoading(false);
        }
        void firstLoad();
        return () => { cancelled = true; };
    }, []);

    const visible = useMemo(() => {
        if (filter === "all") return rows;
        if (filter === "featured") return rows.filter((r) => r.show_message === true);
        return rows.filter((r) => r.show_message !== true);
    }, [rows, filter]);

    const counts = useMemo(() => {
        const total = rows.length;
        const featured = rows.filter((r) => r.show_message === true).length;
        const hidden = total - featured;
        return { total, featured, hidden };
    }, [rows]);

    return (
        <main className="min-h-screen bg-[#FBF7F2] text-zinc-800">
            {/* Background */}
            <div className="pointer-events-none fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-[radial-gradient(1200px_800px_at_10%_10%,rgba(122,0,34,0.08),transparent_60%),radial-gradient(900px_700px_at_90%_20%,rgba(0,0,0,0.05),transparent_55%)]" />
                <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-[#FBF7F2]/55 to-white/80" />
            </div>

            <div className="mx-auto max-w-5xl px-4 pb-16 pt-10 sm:px-6 sm:pt-14">

                {/* ── Header ── */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[#7A0022]/80">
                            Admin
                        </p>
                        <h1 className="mt-1 font-serif text-3xl font-semibold text-zinc-900 sm:text-4xl">
                            Message Manager
                        </h1>
                        <p className="mt-1 text-sm text-zinc-500">
                            Feature messages to show them on the homepage carousel, and set their display order.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2 shrink-0">
                        <Link
                            href="/adminv2"
                            className="inline-flex items-center gap-1.5 rounded-full bg-[#7A0022] px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#64001C] transition"
                        >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            RSVP Dashboard
                        </Link>
                        <button
                            onClick={() => void load()}
                            className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white/85 px-4 py-2.5 text-sm text-zinc-700 hover:bg-white transition"
                        >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Refresh
                        </button>
                    </div>
                </div>

                {/* ── Stat Strip ── */}
                <div className="mb-8 grid grid-cols-3 gap-3">
                    <StatCard label="Total messages" value={counts.total} accent />
                    <StatCard label="Featured" value={counts.featured} dot="bg-emerald-400" />
                    <StatCard label="Hidden" value={counts.hidden} dot="bg-zinc-300" />
                </div>

                {/* ── Filter Pills ── */}
                <div className="mb-6 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 mr-1">Show</span>
                    {([
                        { value: "all", label: "All messages" },
                        { value: "featured", label: "Featured" },
                        { value: "hidden", label: "Hidden" },
                    ] as { value: MsgFilter; label: string }[]).map((f) => (
                        <button
                            key={f.value}
                            onClick={() => setFilter(f.value)}
                            className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${filter === f.value
                                ? "border-[#7A0022] bg-[#7A0022] text-white"
                                : "border-black/10 bg-white/70 text-zinc-600 hover:bg-white"
                                }`}
                        >
                            {f.label}
                        </button>
                    ))}
                    <span className="ml-auto text-xs text-zinc-400">
                        {visible.length} message{visible.length !== 1 ? "s" : ""}
                    </span>
                </div>

                {/* ── Error ── */}
                {error && (
                    <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {/* ── Cards ── */}
                {loading ? (
                    <div className="flex flex-col gap-3">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-32 animate-pulse rounded-[20px] border border-black/5 bg-white/60" />
                        ))}
                    </div>
                ) : visible.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-[28px] border border-black/5 bg-white/60 py-20 text-center">
                        <svg className="mb-3 h-10 w-10 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 16V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2h11l4 4-1-4h1a2 2 0 002-2z" />
                        </svg>
                        <p className="text-sm font-medium text-zinc-400">No messages found</p>
                        <p className="mt-1 text-xs text-zinc-300">Try switching the filter above</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {visible.map((r, idx) => {
                            const isSaving = savingId === r.id;
                            const isFeatured = r.show_message === true;
                            const initials = (r.full_name ?? "?")
                                .split(" ")
                                .slice(0, 2)
                                .map((w) => w[0])
                                .join("")
                                .toUpperCase();

                            return (
                                <div
                                    key={r.id}
                                    className={`relative overflow-hidden rounded-[20px] border bg-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.06)] backdrop-blur-sm transition-all duration-200 ${isFeatured
                                        ? "border-emerald-200 shadow-[0_4px_20px_rgba(16,185,129,0.10)]"
                                        : "border-black/8 hover:shadow-[0_6px_25px_rgba(0,0,0,0.09)]"
                                        }`}
                                >
                                    {/* Featured left bar */}
                                    {isFeatured && (
                                        <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-emerald-400 to-emerald-500 rounded-l-[20px]" />
                                    )}

                                    <div className="flex flex-col gap-4 p-5 pl-6 sm:flex-row sm:items-start">

                                        {/* Avatar */}
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#7A0022]/10 text-sm font-semibold text-[#7A0022]">
                                            {initials}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                                <p className="font-semibold text-zinc-900">{r.full_name || "—"}</p>
                                                {isFeatured && (
                                                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                                                        <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                        </svg>
                                                        Featured
                                                    </span>
                                                )}
                                                {r.display_order !== null && (
                                                    <span className="inline-flex rounded-full border border-black/8 bg-zinc-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                                                        Position {r.display_order}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Message bubble */}
                                            <div className="rounded-2xl rounded-tl-sm bg-zinc-50 border border-black/5 px-4 py-3">
                                                <p className="text-sm leading-relaxed text-zinc-700 whitespace-pre-wrap">
                                                    {r.message}
                                                </p>
                                            </div>

                                            <p className="mt-2 text-[11px] text-zinc-400">
                                                {new Date(r.created_at).toLocaleString("en-MY", {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </p>
                                        </div>

                                        {/* Controls */}
                                        <div className="flex shrink-0 flex-row items-center gap-3 sm:flex-col sm:items-end">
                                            {/* Feature toggle */}
                                            <button
                                                onClick={() => void setFeatured(r.id, !isFeatured)}
                                                disabled={isSaving}
                                                className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-semibold transition disabled:opacity-40 ${isFeatured
                                                    ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                                    : "border-black/10 bg-white text-zinc-600 hover:bg-zinc-50"
                                                    }`}
                                            >
                                                {isSaving ? (
                                                    <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                                    </svg>
                                                ) : (
                                                    <svg className="h-3.5 w-3.5" fill={isFeatured ? "currentColor" : "none"} viewBox="0 0 20 20" stroke="currentColor" strokeWidth={isFeatured ? 0 : 1.5}>
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                )}
                                                {isFeatured ? "Featured" : "Feature"}
                                            </button>

                                            {/* Order picker */}
                                            <div className="flex flex-col items-end gap-0.5">
                                                <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                                                    Order
                                                </label>
                                                <select
                                                    value={r.display_order ?? ""}
                                                    disabled={isSaving}
                                                    onChange={(e) => void updateOrder(r.id, e.target.value)}
                                                    className="rounded-xl border border-black/10 bg-white px-3 py-1.5 text-xs text-zinc-700 disabled:opacity-40"
                                                >
                                                    <option value="">Auto</option>
                                                    {Array.from({ length: 10 }).map((_, i) => (
                                                        <option key={i + 1} value={i + 1}>
                                                            {i + 1}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
}

function StatCard({
    label,
    value,
    accent,
    dot,
}: {
    label: string;
    value: number;
    accent?: boolean;
    dot?: string;
}) {
    return (
        <div
            className={`rounded-[20px] border p-4 shadow-[0_4px_20px_rgba(0,0,0,0.05)] ${accent
                ? "border-[#7A0022]/20 bg-[#7A0022] text-white"
                : "border-black/8 bg-white/75 text-zinc-900"
                }`}
        >
            <div className="flex items-center gap-1.5">
                {dot && <span className={`h-2 w-2 rounded-full ${dot}`} />}
                <p
                    className={`text-[10px] font-semibold uppercase tracking-widest ${accent ? "text-white/70" : "text-zinc-400"
                        }`}
                >
                    {label}
                </p>
            </div>
            <p className={`mt-1 text-2xl font-bold ${accent ? "text-white" : "text-zinc-900"}`}>
                {value}
            </p>
        </div>
    );
}
