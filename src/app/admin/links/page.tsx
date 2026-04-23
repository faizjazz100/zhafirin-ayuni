"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Visit = {
    id: string;
    param: string;
    visitor_id: string;
    country: string | null;
    city: string | null;
    ip: string | null;
    created_at: string;
};

type ParamStat = {
    param: string;
    total: number;
    unique: number;
    countries: { country: string; count: number }[];
};

type VisitorStat = {
    visitor_id: string;
    visits: number;
    country: string | null;
    city: string | null;
    ip: string | null;
    last_seen: string;
};

function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

const FLAG: Record<string, string> = {};
function countryFlag(code: string | null) {
    if (!code) return "🌐";
    if (FLAG[code]) return FLAG[code];
    try {
        const flag = code.toUpperCase().replace(/./g, (c) =>
            String.fromCodePoint(127397 + c.charCodeAt(0))
        );
        FLAG[code] = flag;
        return flag;
    } catch {
        return "🌐";
    }
}

export default function AdminLinksPage() {
    const [visits, setVisits] = useState<Visit[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        const { data } = await supabase
            .from("link_visits")
            .select("*")
            .order("created_at", { ascending: false });
        setVisits((data ?? []) as Visit[]);
        setLastRefresh(new Date());
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    const stats: ParamStat[] = (() => {
        const map: Record<string, { total: number; visitors: Set<string>; countries: Record<string, number> }> = {};
        for (const v of visits) {
            if (!map[v.param]) map[v.param] = { total: 0, visitors: new Set(), countries: {} };
            map[v.param].total++;
            map[v.param].visitors.add(v.visitor_id);
            const c = v.country ?? "Unknown";
            map[v.param].countries[c] = (map[v.param].countries[c] ?? 0) + 1;
        }
        return Object.entries(map).map(([param, d]) => ({
            param,
            total: d.total,
            unique: d.visitors.size,
            countries: Object.entries(d.countries)
                .sort((a, b) => b[1] - a[1])
                .map(([country, count]) => ({ country, count })),
        })).sort((a, b) => b.unique - a.unique);
    })();

    // Per-visitor breakdown: how many times each visitor visited
    const visitorStats: VisitorStat[] = (() => {
        const map: Record<string, { visits: number; country: string | null; city: string | null; ip: string | null; last_seen: string }> = {};
        for (const v of visits) {
            if (!map[v.visitor_id]) {
                map[v.visitor_id] = { visits: 0, country: v.country, city: v.city, ip: v.ip, last_seen: v.created_at };
            }
            map[v.visitor_id].visits++;
            if (v.created_at > map[v.visitor_id].last_seen) {
                map[v.visitor_id].last_seen = v.created_at;
                map[v.visitor_id].country = v.country;
                map[v.visitor_id].city = v.city;
                map[v.visitor_id].ip = v.ip;
            }
        }
        return Object.entries(map)
            .map(([visitor_id, d]) => ({ visitor_id, ...d }))
            .sort((a, b) => b.visits - a.visits);
    })();

    const recent = visits.slice(0, 30);

    return (
        <main className="min-h-screen bg-[#FBF7F2] text-zinc-800">
            <div className="pointer-events-none fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-[radial-gradient(1200px_800px_at_10%_10%,rgba(122,0,34,0.08),transparent_60%)]" />
            </div>

            <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
                {/* Header */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[#7A0022]/80">Admin</p>
                        <h1 className="mt-1 font-serif text-3xl font-semibold text-zinc-900 sm:text-4xl">Link Visitors</h1>
                        <p className="mt-1 text-sm text-zinc-500">
                            {lastRefresh
                                ? `Updated ${lastRefresh.toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit" })}`
                                : "Loading…"}
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
                            <svg className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Per-link stats */}
                <section className="mb-8">
                    <div className="mb-3 flex items-center gap-3">
                        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">By Link</p>
                        <span className="h-px flex-1 bg-black/8" />
                        <span className="text-[10px] text-zinc-400">{visits.length} total visits</span>
                    </div>

                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2].map((i) => <div key={i} className="h-28 animate-pulse rounded-2xl bg-zinc-100" />)}
                        </div>
                    ) : stats.length === 0 ? (
                        <div className="rounded-2xl border border-black/8 bg-white/70 p-8 text-center text-sm text-zinc-400">
                            No visits recorded yet.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {stats.map((s) => (
                                <div key={s.param} className="overflow-hidden rounded-2xl border border-black/8 bg-white/80">
                                    <div className="flex items-center justify-between border-b border-black/6 px-5 py-4">
                                        <div>
                                            <p className="font-semibold text-zinc-900">?{s.param}</p>
                                            <p className="text-xs text-zinc-400 mt-0.5 font-mono">/?{s.param}</p>
                                        </div>
                                        <div className="flex gap-4 text-right">
                                            <div>
                                                <p className="text-2xl font-bold text-zinc-900">{s.unique}</p>
                                                <p className="text-[10px] uppercase tracking-widest text-zinc-400">Unique</p>
                                            </div>
                                            <div>
                                                <p className="text-2xl font-bold text-zinc-400">{s.total}</p>
                                                <p className="text-[10px] uppercase tracking-widest text-zinc-400">Visits</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2 px-5 py-3">
                                        {s.countries.map(({ country, count }) => (
                                            <span
                                                key={country}
                                                className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700"
                                            >
                                                {countryFlag(country === "Unknown" ? null : country)}
                                                <span>{country === "Unknown" ? "Unknown" : country}</span>
                                                <span className="text-zinc-400">· {count}</span>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Per-visitor breakdown */}
                {!loading && visitorStats.length > 0 && (
                    <section className="mb-8">
                        <div className="mb-3 flex items-center gap-3">
                            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Visitors</p>
                            <span className="h-px flex-1 bg-black/8" />
                            <span className="text-[10px] text-zinc-400">{visitorStats.length} unique</span>
                        </div>
                        <div className="overflow-hidden rounded-2xl border border-black/8 bg-white/80">
                            {visitorStats.map((v, i) => (
                                <div
                                    key={v.visitor_id}
                                    className={`flex items-center gap-3 px-5 py-3 ${i !== 0 ? "border-t border-black/5" : ""}`}
                                >
                                    <span className="text-lg shrink-0">{countryFlag(v.country)}</span>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="text-sm font-medium text-zinc-800 font-mono">{v.visitor_id.slice(0, 8)}…</p>
                                            {v.city && <span className="text-xs text-zinc-500">{v.city}{v.country ? `, ${v.country}` : ""}</span>}
                                            {!v.city && v.country && <span className="text-xs text-zinc-500">{v.country}</span>}
                                        </div>
                                        {v.ip && <p className="text-xs text-zinc-400 font-mono">{v.ip}</p>}
                                        <p className="text-xs text-zinc-400">last seen {timeAgo(v.last_seen)}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-lg font-bold text-zinc-900">{v.visits}</p>
                                        <p className="text-[10px] uppercase tracking-widest text-zinc-400">visit{v.visits !== 1 ? "s" : ""}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Recent visits log */}
                {!loading && recent.length > 0 && (
                    <section>
                        <div className="mb-3 flex items-center gap-3">
                            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Recent Visits</p>
                            <span className="h-px flex-1 bg-black/8" />
                        </div>
                        <div className="overflow-hidden rounded-2xl border border-black/8 bg-white/80">
                            {recent.map((v, i) => (
                                <div
                                    key={v.id}
                                    className={`flex items-center gap-3 px-5 py-3 ${i !== 0 ? "border-t border-black/5" : ""}`}
                                >
                                    <span className="text-lg shrink-0">{countryFlag(v.country)}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-zinc-800">
                                            <span className="font-mono text-[#7A0022]">?{v.param}</span>
                                            {v.city && <span className="ml-2 font-normal text-zinc-500">{v.city}{v.country ? `, ${v.country}` : ""}</span>}
                                            {!v.city && v.country && <span className="ml-2 font-normal text-zinc-500">{v.country}</span>}
                                        </p>
                                        <p className="text-xs text-zinc-400 font-mono">
                                            {v.visitor_id.slice(0, 8)}…{v.ip ? ` · ${v.ip}` : ""} · {timeAgo(v.created_at)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </main>
    );
}
