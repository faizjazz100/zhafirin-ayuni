"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type SessionName = "Session 1" | "Session 2" | "Session 3";

type SessionLimitRow = {
    id: number;
    session_name: SessionName;
    guest_limit: number;
    created_at?: string;
};

type RsvpAgg = {
    session: SessionName | null;
    guests: number | null;
};

type GuestRow = {
    id: string;
    full_name: string | null;
    phone: string | null;
    guests: number | null;
    adults: number | null;
    kids: number | null;
    guest_of: "Bride" | "Groom" | null;
    created_at: string;
};

const SESSION_COLORS: Record<
    SessionName,
    { bar: string; badge: string; glow: string; avatarBg: string }
> = {
    "Session 1": {
        bar: "from-amber-400 to-amber-500",
        badge: "bg-amber-50 text-amber-800 border-amber-200",
        glow: "shadow-[0_8px_30px_rgba(251,191,36,0.15)]",
        avatarBg: "bg-amber-100 text-amber-800",
    },
    "Session 2": {
        bar: "from-sky-400 to-sky-500",
        badge: "bg-sky-50 text-sky-800 border-sky-200",
        glow: "shadow-[0_8px_30px_rgba(56,189,248,0.15)]",
        avatarBg: "bg-sky-100 text-sky-800",
    },
    "Session 3": {
        bar: "from-violet-400 to-violet-500",
        badge: "bg-violet-50 text-violet-800 border-violet-200",
        glow: "shadow-[0_8px_30px_rgba(167,139,250,0.15)]",
        avatarBg: "bg-violet-100 text-violet-800",
    },
};

export default function AdminSessionsPage() {
    const [rows, setRows] = useState<SessionLimitRow[]>([]);
    const [rsvpRows, setRsvpRows] = useState<RsvpAgg[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<Record<string, boolean>>({});
    const [saved, setSaved] = useState<Record<string, boolean>>({});
    const [error, setError] = useState("");

    // Drawer
    const [drawerSession, setDrawerSession] = useState<SessionName | null>(null);
    const [guestList, setGuestList] = useState<GuestRow[]>([]);
    const [guestLoading, setGuestLoading] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        const [{ data: limits, error: limitsError }, { data: rsvps, error: rsvpsError }] =
            await Promise.all([
                supabase
                    .from("session_limits")
                    .select("id, session_name, guest_limit, created_at")
                    .order("session_name", { ascending: true }),
                supabase.from("rsvps").select("session, guests"),
            ]);
        if (limitsError) { setError(limitsError.message); setRows([]); setLoading(false); return; }
        if (rsvpsError) { setError(rsvpsError.message); setRsvpRows([]); setRows((limits ?? []) as SessionLimitRow[]); setLoading(false); return; }
        setRows((limits ?? []) as SessionLimitRow[]);
        setRsvpRows((rsvps ?? []) as RsvpAgg[]);
        setLoading(false);
    }, []);

    useEffect(() => {
        let cancelled = false;
        async function init() {
            const [{ data: limits, error: limitsError }, { data: rsvps, error: rsvpsError }] =
                await Promise.all([
                    supabase.from("session_limits").select("id, session_name, guest_limit, created_at").order("session_name", { ascending: true }),
                    supabase.from("rsvps").select("session, guests"),
                ]);
            if (cancelled) return;
            if (limitsError) { setError(limitsError.message); setRows([]); setLoading(false); return; }
            if (rsvpsError) { setError(rsvpsError.message); setRsvpRows([]); setRows((limits ?? []) as SessionLimitRow[]); setLoading(false); return; }
            setRows((limits ?? []) as SessionLimitRow[]);
            setRsvpRows((rsvps ?? []) as RsvpAgg[]);
            setLoading(false);
        }
        void init();
        return () => { cancelled = true; };
    }, []);

    async function openDrawer(sessionName: SessionName) {
        setDrawerSession(sessionName);
        setGuestList([]);
        setGuestLoading(true);
        const { data, error } = await supabase
            .from("rsvps")
            .select("id, full_name, phone, guests, adults, kids, guest_of, created_at")
            .eq("session", sessionName)
            .order("created_at", { ascending: false });
        if (!error) setGuestList((data ?? []) as GuestRow[]);
        setGuestLoading(false);
    }

    function closeDrawer() {
        setDrawerSession(null);
        setGuestList([]);
    }

    const usageMap = useMemo(() => {
        const map: Record<string, number> = { "Session 1": 0, "Session 2": 0, "Session 3": 0 };
        for (const row of rsvpRows) {
            if (!row.session) continue;
            map[row.session] = (map[row.session] ?? 0) + (Number(row.guests) || 0);
        }
        return map;
    }, [rsvpRows]);

    const totalStats = useMemo(() => {
        const totalLimit = rows.reduce((s, r) => s + r.guest_limit, 0);
        const totalUsed = Object.values(usageMap).reduce((s, v) => s + v, 0);
        return { totalLimit, totalUsed, totalRemaining: Math.max(0, totalLimit - totalUsed) };
    }, [rows, usageMap]);

    function updateLocalLimit(sessionName: SessionName, value: number) {
        setRows((prev) =>
            prev.map((row) =>
                row.session_name === sessionName ? { ...row, guest_limit: Math.max(0, value) } : row
            )
        );
    }

    async function saveRow(row: SessionLimitRow) {
        setSaving((prev) => ({ ...prev, [row.session_name]: true }));
        setError("");
        const { error } = await supabase
            .from("session_limits")
            .update({ guest_limit: Math.max(0, Number(row.guest_limit) || 0) })
            .eq("id", row.id);
        if (error) {
            setError(`Failed to save ${row.session_name}: ${error.message}`);
        } else {
            setSaved((prev) => ({ ...prev, [row.session_name]: true }));
            setTimeout(() => setSaved((prev) => { const c = { ...prev }; delete c[row.session_name]; return c; }), 2000);
            await load();
        }
        setSaving((prev) => { const copy = { ...prev }; delete copy[row.session_name]; return copy; });
    }

    const drawerColors = drawerSession ? SESSION_COLORS[drawerSession] : null;
    const drawerTotal = guestList.reduce((s, g) => s + (Number(g.guests) || 0), 0);
    const drawerKids = guestList.reduce((s, g) => s + (Number(g.kids) || 0), 0);

    return (
        <>
            <main className="min-h-screen bg-[#FBF7F2] text-zinc-800">
                {/* Background */}
                <div className="pointer-events-none fixed inset-0 -z-10">
                    <div className="absolute inset-0 bg-[radial-gradient(1200px_800px_at_10%_10%,rgba(122,0,34,0.08),transparent_60%),radial-gradient(900px_700px_at_90%_20%,rgba(0,0,0,0.05),transparent_55%)]" />
                    <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-[#FBF7F2]/55 to-white/80" />
                </div>

                <div className="mx-auto max-w-4xl px-4 pb-16 pt-10 sm:px-6 sm:pt-14">

                    {/* ── Header ── */}
                    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[#7A0022]/80">Admin</p>
                            <h1 className="mt-1 font-serif text-3xl font-semibold text-zinc-900 sm:text-4xl">Session Limits</h1>
                            <p className="mt-1 text-sm text-zinc-500">Set the maximum number of guests per session.</p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                            <Link
                                href="/admin"
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

                    {/* ── Summary strip ── */}
                    <div className="mb-8 grid grid-cols-3 gap-3">
                        <StatCard label="Total capacity" value={totalStats.totalLimit} accent />
                        <StatCard label="Guests RSVPed" value={totalStats.totalUsed} dot="bg-[#7A0022]" />
                        <StatCard label="Slots remaining" value={totalStats.totalRemaining} dot="bg-emerald-400" />
                    </div>

                    {error && (
                        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
                    )}

                    {/* ── Session Cards ── */}
                    {loading ? (
                        <div className="grid gap-4 md:grid-cols-3">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="h-72 animate-pulse rounded-[24px] border border-black/5 bg-white/60" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-3">
                            {rows.map((row) => {
                                const used = usageMap[row.session_name] ?? 0;
                                const limit = row.guest_limit;
                                const remaining = Math.max(0, limit - used);
                                const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
                                const isSaving = !!saving[row.session_name];
                                const isSaved = !!saved[row.session_name];
                                const colors = SESSION_COLORS[row.session_name];
                                const statusColor = pct >= 90 ? "text-red-600" : pct >= 70 ? "text-amber-600" : "text-emerald-600";

                                return (
                                    <div
                                        key={row.id}
                                        className={`flex flex-col overflow-hidden rounded-[24px] border border-white/60 bg-white/80 backdrop-blur-sm transition-all ${colors.glow}`}
                                    >
                                        <div className={`h-1.5 w-full bg-gradient-to-r ${colors.bar}`} />

                                        <div className="flex flex-1 flex-col gap-4 p-5">
                                            <div className="flex items-center justify-between">
                                                <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wider ${colors.badge}`}>
                                                    {row.session_name}
                                                </span>
                                                <span className={`text-xs font-semibold ${statusColor}`}>{pct}% full</span>
                                            </div>

                                            <div>
                                                <div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-100">
                                                    <div
                                                        className={`h-full rounded-full bg-gradient-to-r transition-all duration-500 ${colors.bar}`}
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </div>
                                                <div className="mt-2 flex justify-between text-[11px] text-zinc-400">
                                                    <span>{used} used</span>
                                                    <span>{remaining} left of {limit}</span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2">
                                                <InfoTile label="RSVPed" value={used} />
                                                <InfoTile label="Remaining" value={remaining} highlight={remaining === 0} />
                                            </div>

                                            {/* View Guest List button */}
                                            <button
                                                onClick={() => void openDrawer(row.session_name)}
                                                className="flex w-full items-center justify-center gap-2 rounded-xl border border-black/8 bg-zinc-50 px-4 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 transition"
                                            >
                                                <svg className="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                View Guest List
                                            </button>

                                            <div>
                                                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
                                                    Guest limit
                                                </label>
                                                <input
                                                    type="number"
                                                    min={0}
                                                    value={row.guest_limit}
                                                    onChange={(e) => updateLocalLimit(row.session_name, Number(e.target.value || 0))}
                                                    className="w-full rounded-xl border border-black/10 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 outline-none focus:border-zinc-300 focus:bg-white transition"
                                                />
                                            </div>

                                            <button
                                                onClick={() => saveRow(row)}
                                                disabled={isSaving}
                                                className={`mt-auto w-full rounded-xl px-4 py-2.5 text-sm font-medium transition disabled:opacity-50 ${isSaved ? "bg-emerald-500 text-white" : "bg-[#7A0022] text-white hover:bg-[#64001C]"
                                                    }`}
                                            >
                                                {isSaving ? (
                                                    <span className="flex items-center justify-center gap-2">
                                                        <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                                        </svg>
                                                        Saving…
                                                    </span>
                                                ) : isSaved ? (
                                                    <span className="flex items-center justify-center gap-2">
                                                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        Saved!
                                                    </span>
                                                ) : (
                                                    `Save ${row.session_name}`
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>

            {/* ── Guest List Drawer ── */}
            {drawerSession && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeDrawer} />

                    {/* Sliding panel */}
                    <div className="relative flex h-full w-full max-w-md flex-col bg-[#FDFAF7] shadow-[-20px_0_60px_rgba(0,0,0,0.12)]">
                        {/* Coloured top stripe */}
                        <div className={`h-1.5 w-full shrink-0 bg-gradient-to-r ${drawerColors!.bar}`} />

                        {/* Header */}
                        <div className="shrink-0 px-6 py-5">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-zinc-400">
                                        Guest List
                                    </p>
                                    <h2 className="mt-0.5 font-serif text-2xl font-semibold text-zinc-900">
                                        {drawerSession}
                                    </h2>
                                    {!guestLoading && (
                                        <p className="mt-1 text-sm text-zinc-500">
                                            {guestList.length} submission{guestList.length !== 1 ? "s" : ""} · {drawerTotal} guest{drawerTotal !== 1 ? "s" : ""} total
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={closeDrawer}
                                    className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white text-zinc-500 hover:bg-zinc-100 transition"
                                >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="mx-6 h-px bg-black/5" />

                        {/* Scrollable guest list */}
                        <div className="flex-1 overflow-y-auto px-6 py-4">
                            {guestLoading ? (
                                <div className="flex flex-col gap-3">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="h-[72px] animate-pulse rounded-2xl bg-zinc-100" />
                                    ))}
                                </div>
                            ) : guestList.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <svg className="mb-3 h-10 w-10 text-zinc-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <p className="text-sm font-medium text-zinc-400">No RSVPs yet</p>
                                    <p className="mt-1 text-xs text-zinc-300">Guests for {drawerSession} will appear here</p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-2.5">
                                    {guestList.map((g, idx) => {
                                        const initials = (g.full_name ?? "?")
                                            .split(" ")
                                            .slice(0, 2)
                                            .map((w) => w[0])
                                            .join("")
                                            .toUpperCase();

                                        return (
                                            <div
                                                key={g.id}
                                                className="flex items-center gap-3 rounded-2xl border border-black/5 bg-white px-4 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
                                            >
                                                {/* Row number */}
                                                <span className="w-5 shrink-0 text-center text-[11px] font-semibold text-zinc-300">
                                                    {idx + 1}
                                                </span>

                                                {/* Avatar */}
                                                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${drawerColors!.avatarBg}`}>
                                                    {initials}
                                                </div>

                                                {/* Name + phone */}
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-semibold text-zinc-900">
                                                        {g.full_name || "—"}
                                                    </p>
                                                    <p className="text-xs text-zinc-400">{g.phone || "No phone"}</p>
                                                </div>

                                                {/* Right side: guest count + side badge */}
                                                <div className="flex shrink-0 flex-col items-end gap-1.5">
                                                    <div className="flex items-center gap-1">
                                                        <span className="rounded-lg border border-black/6 bg-zinc-50 px-2 py-0.5 text-[11px] font-semibold text-zinc-600">
                                                            👥 {g.guests ?? 0}
                                                        </span>
                                                        {(g.kids ?? 0) > 0 && (
                                                            <span className="rounded-lg border border-black/6 bg-zinc-50 px-2 py-0.5 text-[11px] font-semibold text-zinc-600">
                                                                🧒 {g.kids}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {g.guest_of && (
                                                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${g.guest_of === "Bride"
                                                            ? "border-rose-200 bg-rose-50 text-rose-700"
                                                            : "border-slate-200 bg-slate-50 text-slate-600"
                                                            }`}>
                                                            {g.guest_of}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Footer totals */}
                        {!guestLoading && guestList.length > 0 && (
                            <div className="shrink-0 border-t border-black/5 bg-white/80 px-6 py-4">
                                <div className="grid grid-cols-3 gap-3 text-center">
                                    <div>
                                        <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Submissions</p>
                                        <p className="mt-0.5 text-xl font-bold text-zinc-900">{guestList.length}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Guests</p>
                                        <p className="mt-0.5 text-xl font-bold text-zinc-900">{drawerTotal}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Kids</p>
                                        <p className="mt-0.5 text-xl font-bold text-zinc-900">{drawerKids}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}

function InfoTile({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
    return (
        <div className={`rounded-xl border px-3 py-2.5 ${highlight && value === 0 ? "border-red-200 bg-red-50" : "border-black/5 bg-zinc-50"}`}>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">{label}</p>
            <p className={`mt-0.5 text-xl font-bold ${highlight && value === 0 ? "text-red-600" : "text-zinc-900"}`}>{value}</p>
        </div>
    );
}

function StatCard({ label, value, accent, dot }: { label: string; value: number; accent?: boolean; dot?: string }) {
    return (
        <div className={`rounded-[20px] border p-4 shadow-[0_4px_20px_rgba(0,0,0,0.05)] ${accent ? "border-[#7A0022]/20 bg-[#7A0022] text-white" : "border-black/8 bg-white/75 text-zinc-900"}`}>
            <div className="flex items-center gap-1.5">
                {dot && <span className={`h-2 w-2 rounded-full ${dot}`} />}
                <p className={`text-[10px] font-semibold uppercase tracking-widest ${accent ? "text-white/70" : "text-zinc-400"}`}>{label}</p>
            </div>
            <p className={`mt-1 text-2xl font-bold ${accent ? "text-white" : "text-zinc-900"}`}>{value}</p>
        </div>
    );
}