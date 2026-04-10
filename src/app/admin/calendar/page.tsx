"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

type Session = "Session 1" | "Session 2" | "Session 3";
type GuestOf = "Bride" | "Groom";

type RsvpRow = {
    id: string;
    full_name: string | null;
    phone: string | null;
    guests: number | null;
    session: Session | null;
    guest_of: GuestOf | null;
    created_at: string;
};

const SESSION_COLORS: Record<Session, string> = {
    "Session 1": "bg-amber-100 text-amber-800 border-amber-200",
    "Session 2": "bg-sky-100 text-sky-800 border-sky-200",
    "Session 3": "bg-violet-100 text-violet-800 border-violet-200",
};

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

function toDateKey(iso: string) {
    const d = new Date(iso);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function buildGrid(year: number, month: number): (Date | null)[] {
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const startPad = first.getDay(); // 0=Sun
    const totalCells = Math.ceil((startPad + last.getDate()) / 7) * 7;
    const cells: (Date | null)[] = [];
    for (let i = 0; i < totalCells; i++) {
        const dayNum = i - startPad + 1;
        if (dayNum < 1 || dayNum > last.getDate()) {
            cells.push(null);
        } else {
            cells.push(new Date(year, month, dayNum));
        }
    }
    return cells;
}

export default function AdminCalendarPage() {
    const [rows, setRows] = useState<RsvpRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [viewDate, setViewDate] = useState(() => new Date());
    const [selected, setSelected] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        const { data, error: err } = await supabase
            .from("rsvps")
            .select("id, full_name, phone, guests, session, guest_of, created_at")
            .order("created_at", { ascending: false });
        if (err) setError(err.message);
        else setRows(data ?? []);
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    // Group rows by "YYYY-MM-DD"
    const byDate = useMemo(() => {
        const map: Record<string, RsvpRow[]> = {};
        rows.forEach((r) => {
            const key = toDateKey(r.created_at);
            map[key] = [...(map[key] ?? []), r];
        });
        return map;
    }, [rows]);

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const grid = useMemo(() => buildGrid(year, month), [year, month]);

    const todayKey = toDateKey(new Date().toString());

    function prevMonth() {
        setViewDate(new Date(year, month - 1, 1));
        setSelected(null);
    }
    function nextMonth() {
        setViewDate(new Date(year, month + 1, 1));
        setSelected(null);
    }
    function goToday() {
        setViewDate(new Date());
        setSelected(null);
    }

    function cellKey(d: Date) {
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    }

    const selectedRows = selected ? (byDate[selected] ?? []) : [];

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
                        <h1 className="mt-1 font-serif text-3xl font-semibold text-zinc-900 sm:text-4xl">
                            RSVP Calendar
                        </h1>
                        <p className="mt-1 text-sm text-zinc-500">
                            {loading ? "Loading…" : `${rows.length} submission${rows.length !== 1 ? "s" : ""} · click a day to view`}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2 shrink-0">
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
                    <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {/* Calendar card */}
                <div className="rounded-[28px] border border-black/10 bg-white/75 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.07)] sm:p-6">

                    {/* Month navigator */}
                    <div className="mb-4 flex items-center justify-between gap-2">
                        <button
                            onClick={prevMonth}
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white/80 text-zinc-700 hover:bg-white transition"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>

                        <div className="flex items-center gap-2">
                            <span className="font-serif text-lg font-semibold text-zinc-900">
                                {MONTH_NAMES[month]} {year}
                            </span>
                            <button
                                onClick={goToday}
                                className="rounded-full border border-black/10 bg-white/80 px-3 py-1 text-xs text-zinc-600 hover:bg-white transition"
                            >
                                Today
                            </button>
                        </div>

                        <button
                            onClick={nextMonth}
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white/80 text-zinc-700 hover:bg-white transition"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>

                    {/* Day-of-week headers */}
                    <div className="mb-1 grid grid-cols-7">
                        {DAY_LABELS.map((d) => (
                            <div key={d} className="py-1 text-center text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                                {d}
                            </div>
                        ))}
                    </div>

                    {/* Calendar grid */}
                    {loading ? (
                        <div className="grid grid-cols-7 gap-1">
                            {Array.from({ length: 35 }).map((_, i) => (
                                <div key={i} className="h-12 animate-pulse rounded-xl bg-zinc-100" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-7 gap-1">
                            {grid.map((date, i) => {
                                if (!date) {
                                    return <div key={i} className="h-12" />;
                                }
                                const key = cellKey(date);
                                const count = byDate[key]?.length ?? 0;
                                const isToday = key === todayKey;
                                const isSelected = key === selected;
                                const hasData = count > 0;

                                return (
                                    <button
                                        key={key}
                                        onClick={() => setSelected(isSelected ? null : key)}
                                        className={[
                                            "relative flex h-12 flex-col items-center justify-center rounded-xl border text-sm transition",
                                            isSelected
                                                ? "border-[#7A0022] bg-[#7A0022] text-white shadow-md"
                                                : isToday
                                                ? "border-[#7A0022]/50 bg-[#7A0022]/5 font-semibold text-[#7A0022]"
                                                : hasData
                                                ? "border-[#7A0022]/15 bg-[#7A0022]/5 text-zinc-800 hover:border-[#7A0022]/30 hover:bg-[#7A0022]/10"
                                                : "border-transparent text-zinc-400 hover:bg-zinc-50",
                                        ].join(" ")}
                                    >
                                        <span className="text-[13px] leading-none">{date.getDate()}</span>
                                        {hasData && (
                                            <span className={[
                                                "mt-0.5 rounded-full px-1.5 text-[9px] font-bold leading-tight",
                                                isSelected
                                                    ? "bg-white/25 text-white"
                                                    : "bg-[#7A0022] text-white",
                                            ].join(" ")}>
                                                {count}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Legend */}
                    <div className="mt-4 flex flex-wrap gap-4 border-t border-black/5 pt-4 text-xs text-zinc-500">
                        <span className="flex items-center gap-1.5">
                            <span className="inline-block h-3 w-3 rounded-sm bg-[#7A0022]/10 border border-[#7A0022]/20" />
                            Has submissions
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="inline-block h-3 w-3 rounded-sm border border-[#7A0022]/50 bg-[#7A0022]/5" />
                            Today
                        </span>
                    </div>
                </div>

                {/* Daily trend chart */}
                {!loading && rows.length > 0 && (() => {
                    const map: Record<string, number> = {};
                    rows.forEach((r) => {
                        const d = new Date(r.created_at);
                        const key = `${d.getMonth() + 1}/${d.getDate()}`;
                        map[key] = (map[key] ?? 0) + 1;
                    });
                    const data = Object.entries(map)
                        .sort((a, b) => {
                            const [am, ad] = a[0].split("/").map(Number);
                            const [bm, bd] = b[0].split("/").map(Number);
                            return am !== bm ? am - bm : ad - bd;
                        })
                        .map(([date, count]) => ({ date, count }));
                    return (
                        <div className="mt-6 rounded-[20px] border border-black/10 bg-white/75 px-5 py-4 shadow-[0_4px_16px_rgba(0,0,0,0.05)]">
                            <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-zinc-400">Daily Submissions</p>
                            <ResponsiveContainer width="100%" height={130}>
                                <AreaChart data={data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="calGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#7A0022" stopOpacity={0.18} />
                                            <stop offset="95%" stopColor="#7A0022" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#a1a1aa" }} tickLine={false} axisLine={false} />
                                    <YAxis tick={{ fontSize: 10, fill: "#a1a1aa" }} tickLine={false} axisLine={false} allowDecimals={false} />
                                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 10, border: "1px solid #e4e4e7", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }} />
                                    <Area type="monotone" dataKey="count" stroke="#7A0022" strokeWidth={2} fill="url(#calGrad)" dot={false} name="Submissions" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    );
                })()}

                {/* Selected day submissions */}
                {selected && (
                    <div className="mt-6">
                        <p className="mb-3 text-sm font-semibold text-zinc-700">
                            {new Date(selected + "T00:00:00").toLocaleDateString("en-MY", {
                                weekday: "long", day: "numeric", month: "long", year: "numeric",
                            })}
                            <span className="ml-2 text-zinc-400 font-normal">
                                — {selectedRows.length} submission{selectedRows.length !== 1 ? "s" : ""}
                            </span>
                        </p>

                        {selectedRows.length === 0 ? (
                            <div className="rounded-[20px] border border-black/10 bg-white/70 p-6 text-sm text-zinc-400 text-center">
                                No submissions on this day.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {selectedRows.map((r) => (
                                    <div
                                        key={r.id}
                                        className="flex items-start justify-between gap-4 rounded-[20px] border border-black/10 bg-white/75 px-5 py-4 shadow-[0_4px_16px_rgba(0,0,0,0.05)]"
                                    >
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold text-zinc-900">
                                                {r.full_name ?? "—"}
                                            </p>
                                            <p className="mt-0.5 text-xs text-zinc-500">{r.phone ?? "—"}</p>
                                            <p className="mt-1 text-xs text-zinc-400">
                                                {new Date(r.created_at).toLocaleTimeString("en-MY", {
                                                    hour: "2-digit", minute: "2-digit",
                                                })}
                                            </p>
                                        </div>

                                        <div className="flex shrink-0 flex-col items-end gap-1.5">
                                            {r.session && (
                                                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${SESSION_COLORS[r.session]}`}>
                                                    {r.session}
                                                </span>
                                            )}
                                            {r.guest_of && (
                                                <span className="rounded-full border border-black/10 bg-white px-2 py-0.5 text-[10px] text-zinc-600">
                                                    {r.guest_of}&apos;s side
                                                </span>
                                            )}
                                            <span className="text-xs text-zinc-500">
                                                👥 {r.guests ?? 0} guest{(r.guests ?? 0) !== 1 ? "s" : ""}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}
