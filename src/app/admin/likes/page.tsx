"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Like = {
    id: string;
    phone: string;
    created_at: string;
    name?: string;
};

function normalizeVariants(phone: string): string[] {
    const variants = [phone];
    if (phone.startsWith("0")) variants.push("+60" + phone.slice(1));
    else if (phone.startsWith("+60")) variants.push("0" + phone.slice(3));
    return variants;
}

export default function AdminLikesPage() {
    const [likes, setLikes] = useState<Like[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const load = useCallback(async () => {
        setLoading(true);
        setError("");

        const { data: likeRows, error: likeErr } = await supabase
            .from("story_likes")
            .select("id, phone, created_at")
            .order("created_at", { ascending: false });

        if (likeErr) { setError(likeErr.message); setLoading(false); return; }
        if (!likeRows || likeRows.length === 0) { setLikes([]); setLoading(false); return; }

        // Gather all phone variants to query rsvps
        const allPhones = likeRows.flatMap((r) => normalizeVariants(r.phone));
        const { data: rsvps } = await supabase
            .from("rsvps")
            .select("phone, full_name")
            .in("phone", allPhones);

        // Build phone → name map
        const nameMap: Record<string, string> = {};
        (rsvps ?? []).forEach((r) => {
            normalizeVariants(r.phone).forEach((v) => { nameMap[v] = r.full_name ?? ""; });
        });

        setLikes(likeRows.map((r) => ({
            ...r,
            name: normalizeVariants(r.phone).map((v) => nameMap[v]).find(Boolean) ?? "",
        })));
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    function formatDate(iso: string) {
        return new Date(iso).toLocaleDateString("en-MY", {
            day: "numeric", month: "short", year: "numeric",
            hour: "2-digit", minute: "2-digit",
        });
    }

    return (
        <main className="min-h-screen bg-[#FBF7F2] text-zinc-800">
            <div className="pointer-events-none fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-[radial-gradient(1200px_800px_at_10%_10%,rgba(122,0,34,0.08),transparent_60%)]" />
            </div>

            <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">

                {/* Header */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[#7A0022]/80">Admin</p>
                        <h1 className="mt-1 font-serif text-3xl font-semibold text-zinc-900 sm:text-4xl">Story Likes</h1>
                        <p className="mt-1 text-sm text-zinc-500">
                            {loading ? "Loading…" : `${likes.length} like${likes.length !== 1 ? "s" : ""}`}
                        </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                        <Link
                            href="/admin"
                            className="inline-flex items-center gap-1.5 rounded-full bg-[#7A0022] px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#64001C] transition"
                        >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Dashboard
                        </Link>
                        <button
                            onClick={load}
                            className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white/85 px-4 py-2.5 text-sm text-zinc-700 hover:bg-white transition"
                        >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Refresh
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
                )}

                {loading ? (
                    <div className="space-y-2.5">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-16 animate-pulse rounded-2xl bg-zinc-100" />
                        ))}
                    </div>
                ) : likes.length === 0 ? (
                    <div className="rounded-[20px] border border-black/10 bg-white/70 p-8 text-center text-sm text-zinc-400">
                        No likes yet.
                    </div>
                ) : (
                    <div className="space-y-2.5">
                        {likes.map((like, i) => (
                            <div
                                key={like.id}
                                className="flex items-center justify-between gap-4 rounded-[20px] border border-black/10 bg-white/75 px-5 py-4 shadow-[0_4px_16px_rgba(0,0,0,0.04)]"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose-50 text-xs font-semibold text-rose-400">
                                        {i + 1}
                                    </span>
                                    <div>
                                        <p className="text-sm font-semibold text-zinc-900">
                                            {like.name || <span className="font-normal italic text-zinc-400">No RSVP found</span>}
                                        </p>
                                        <p className="text-xs text-zinc-400">{like.phone}</p>
                                    </div>
                                </div>
                                <p className="shrink-0 text-xs text-zinc-400">{formatDate(like.created_at)}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
