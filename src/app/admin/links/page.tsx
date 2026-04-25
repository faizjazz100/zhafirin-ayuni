"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase";

const VisitorMap = dynamic(() => import("./VisitorMap"), { ssr: false });

type Visit = {
    id: string;
    param: string;
    visitor_id: string;
    country: string | null;
    city: string | null;
    ip: string | null;
    device: string | null;
    lat: number | null;
    lng: number | null;
    created_at: string;
};

type ParamStat = {
    param: string;
    total: number;
    unique: number;
    countries: { country: string; count: number }[];
};

type IpGroup = {
    key: string;
    ip: string | null;
    visitor_id: string;
    country: string | null;
    city: string | null;
    device: string | null;
    lat: number | null;
    lng: number | null;
    params: string[];
    visits: Visit[];
};

type VisitorLabels = Record<string, string>;

function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

function fmtDate(iso: string) {
    return new Date(iso).toLocaleString("en-MY", {
        day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
    });
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
    } catch { return "🌐"; }
}

const DEVICE_ICON: Record<string, string> = { mobile: "📱", tablet: "📱", desktop: "🖥️" };

function ParamBadge({ param }: { param: string }) {
    return (
        <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-mono font-medium text-zinc-600">
            {param === "direct" ? "/" : `?${param}`}
        </span>
    );
}

function VisitorRow({ group, label, onSaveLabel }: {
    group: IpGroup;
    label: string | undefined;
    onSaveLabel: (visitorId: string, name: string) => Promise<void>;
}) {
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(false);
    const [input, setInput] = useState(label ?? "");
    const [saving, setSaving] = useState(false);

    async function handleSave() {
        const trimmed = input.trim();
        if (!trimmed) return;
        setSaving(true);
        await onSaveLabel(group.visitor_id, trimmed);
        setSaving(false);
        setEditing(false);
    }

    const lastVisit = group.visits[0];

    return (
        <div>
            <div className="flex items-center gap-3 px-5 py-3">
                <span className="text-lg shrink-0">{countryFlag(group.country)}</span>
                <div className="flex-1 min-w-0">
                    {editing ? (
                        <div className="flex items-center gap-2">
                            <input
                                autoFocus
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") setEditing(false); }}
                                placeholder="Enter name…"
                                className="flex-1 rounded-xl border border-black/10 bg-zinc-50 px-3 py-1.5 text-sm outline-none focus:border-[#7A0022]/30 focus:ring-2 focus:ring-[#7A0022]/10"
                            />
                            <button onClick={handleSave} disabled={saving || !input.trim()} className="rounded-xl bg-[#7A0022] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50 transition">
                                {saving ? "…" : "Save"}
                            </button>
                            <button onClick={() => { setEditing(false); setInput(label ?? ""); }} className="rounded-xl border border-black/10 px-3 py-1.5 text-xs text-zinc-500 transition hover:bg-zinc-50">
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-base" title={group.device ?? "desktop"}>
                                {DEVICE_ICON[group.device ?? "desktop"] ?? "🖥️"}
                            </span>
                            {label
                                ? <span className="text-sm font-semibold text-zinc-900">{label}</span>
                                : <span className="text-sm font-mono text-zinc-500">{group.ip ?? `${group.visitor_id.slice(0, 8)}…`}</span>
                            }
                            {group.city && <span className="text-xs text-zinc-400">{group.city}{group.country ? `, ${group.country}` : ""}</span>}
                            {!group.city && group.country && <span className="text-xs text-zinc-400">{group.country}</span>}
                            <button onClick={() => { setEditing(true); setInput(label ?? ""); }} className="text-[10px] font-medium text-[#7A0022]/60 hover:text-[#7A0022] transition">
                                {label ? "rename" : "name"}
                            </button>
                        </div>
                    )}
                    {!editing && (
                        <div className="mt-1 flex flex-wrap items-center gap-1">
                            {group.params.map((p) => <ParamBadge key={p} param={p} />)}
                            <span className="text-[10px] text-zinc-400 ml-0.5">· last {timeAgo(lastVisit.created_at)}</span>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                        <p className="text-lg font-bold text-zinc-900">{group.visits.length}</p>
                        <p className="text-[10px] uppercase tracking-widest text-zinc-400">visit{group.visits.length !== 1 ? "s" : ""}</p>
                    </div>
                    <button
                        onClick={() => setOpen((v) => !v)}
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-black/10 bg-zinc-50 text-zinc-400 hover:bg-zinc-100 transition"
                    >
                        <svg className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                </div>
            </div>

            {open && (
                <div className="border-t border-black/5 bg-zinc-50/80 px-5 py-2 space-y-1.5">
                    {group.visits.map((v) => (
                        <div key={v.id} className="flex items-center gap-2 text-xs text-zinc-500">
                            <span>{DEVICE_ICON[v.device ?? "desktop"] ?? "🖥️"}</span>
                            <ParamBadge param={v.param} />
                            <span className="text-zinc-400">{fmtDate(v.created_at)}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function AdminLinksPage() {
    const [visits, setVisits] = useState<Visit[]>([]);
    const [labels, setLabels] = useState<VisitorLabels>({});
    const [loading, setLoading] = useState(true);
    const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        const [{ data: visitData }, { data: labelData }] = await Promise.all([
            supabase.from("link_visits").select("*").order("created_at", { ascending: false }),
            supabase.from("visitor_labels").select("visitor_id, name"),
        ]);
        setVisits((visitData ?? []) as Visit[]);
        const lmap: VisitorLabels = {};
        (labelData ?? []).forEach((r: { visitor_id: string; name: string }) => { lmap[r.visitor_id] = r.name; });
        setLabels(lmap);
        setLastRefresh(new Date());
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    async function saveLabel(visitorId: string, name: string) {
        await supabase.from("visitor_labels").upsert({ visitor_id: visitorId, name });
        setLabels((prev) => ({ ...prev, [visitorId]: name }));
    }

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

    const ipGroups: IpGroup[] = (() => {
        const map: Record<string, IpGroup> = {};
        for (const v of visits) {
            const key = v.ip ?? v.visitor_id;
            if (!map[key]) {
                map[key] = { key, ip: v.ip, visitor_id: v.visitor_id, country: v.country, city: v.city, device: v.device, lat: v.lat, lng: v.lng, params: [], visits: [] };
            }
            map[key].visits.push(v);
            if (!map[key].params.includes(v.param)) map[key].params.push(v.param);
        }
        return Object.values(map).sort((a, b) =>
            new Date(b.visits[0].created_at).getTime() - new Date(a.visits[0].created_at).getTime()
        );
    })();

    const mapMarkers = ipGroups
        .filter((g) => g.lat !== null && g.lng !== null)
        .map((g) => ({
            lat: g.lat!,
            lng: g.lng!,
            label: labels[g.visitor_id] ?? g.ip ?? g.visitor_id.slice(0, 8),
            device: g.device,
        }));

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
                            {lastRefresh ? `Updated ${lastRefresh.toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit" })}` : "Loading…"}
                        </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                        <Link href="/admin" className="inline-flex items-center gap-1.5 rounded-full bg-[#7A0022] px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#64001C] transition">
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Dashboard
                        </Link>
                        <button onClick={load} className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white/85 px-4 py-2.5 text-sm text-zinc-700 hover:bg-white transition">
                            <svg className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Map */}
                {!loading && mapMarkers.length > 0 && (
                    <section className="mb-8">
                        <div className="mb-3 flex items-center gap-3">
                            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Map</p>
                            <span className="h-px flex-1 bg-black/8" />
                            <span className="text-[10px] text-zinc-400">{mapMarkers.length} located</span>
                        </div>
                        <VisitorMap markers={mapMarkers} />
                    </section>
                )}

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
                        <div className="rounded-2xl border border-black/8 bg-white/70 p-8 text-center text-sm text-zinc-400">No visits recorded yet.</div>
                    ) : (
                        <div className="space-y-3">
                            {stats.map((s) => (
                                <div key={s.param} className="overflow-hidden rounded-2xl border border-black/8 bg-white/80">
                                    <div className="flex items-center justify-between border-b border-black/6 px-5 py-4">
                                        <div>
                                            <p className="font-semibold text-zinc-900">{s.param === "direct" ? "Direct visit" : `?${s.param}`}</p>
                                            <p className="text-xs text-zinc-400 mt-0.5 font-mono">{s.param === "direct" ? "/" : `/?${s.param}`}</p>
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
                                            <span key={country} className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700">
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

                {/* Visitors grouped by IP */}
                {!loading && ipGroups.length > 0 && (
                    <section className="mb-8">
                        <div className="mb-3 flex items-center gap-3">
                            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Visitors</p>
                            <span className="h-px flex-1 bg-black/8" />
                            <span className="text-[10px] text-zinc-400">{ipGroups.length} unique</span>
                        </div>
                        <div className="divide-y divide-black/5 overflow-hidden rounded-2xl border border-black/8 bg-white/80">
                            {ipGroups.map((g) => (
                                <VisitorRow key={g.key} group={g} label={labels[g.visitor_id]} onSaveLabel={saveLabel} />
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
                        <div className="divide-y divide-black/5 overflow-hidden rounded-2xl border border-black/8 bg-white/80">
                            {recent.map((v) => (
                                <div key={v.id} className="flex items-center gap-3 px-5 py-3">
                                    <span className="text-lg shrink-0">{countryFlag(v.country)}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-zinc-800">
                                            <span className="mr-1">{DEVICE_ICON[v.device ?? "desktop"] ?? "🖥️"}</span>
                                            <span className="font-mono text-[#7A0022]">{v.param === "direct" ? "/" : `/?${v.param}`}</span>
                                            {v.city && <span className="ml-2 font-normal text-zinc-500">{v.city}{v.country ? `, ${v.country}` : ""}</span>}
                                            {!v.city && v.country && <span className="ml-2 font-normal text-zinc-500">{v.country}</span>}
                                        </p>
                                        <p className="text-xs text-zinc-400 font-mono">
                                            {labels[v.visitor_id]
                                                ? <span className="not-italic font-sans font-medium text-zinc-600">{labels[v.visitor_id]} · </span>
                                                : `${v.visitor_id.slice(0, 8)}… · `}
                                            {v.ip ? `${v.ip} · ` : ""}{timeAgo(v.created_at)}
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
