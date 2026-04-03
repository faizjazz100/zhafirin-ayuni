"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Session = "Session 1" | "Session 2" | "Session 3";
type GuestOf = "Bride" | "Groom";
type SessionFilter = "All" | Session;
type GuestOfFilter = "All" | GuestOf;
type Sort = "newest" | "oldest" | "name_az";

export const dynamic = "force-dynamic";

type RsvpRow = {
    id: string;
    full_name: string | null;
    phone: string | null;
    guests: number | null;
    adults: number | null;
    kids: number | null;
    session: Session | null;
    guest_of: GuestOf | null;
    message: string | null;
    created_at: string;
};

export default function CompactAdminPage() {
    const [rows, setRows] = useState<RsvpRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [sessionFilter, setSessionFilter] = useState<SessionFilter>("All");
    const [guestOfFilter, setGuestOfFilter] = useState<GuestOfFilter>("All");
    const [sort, setSort] = useState<Sort>("newest");
    const [error, setError] = useState("");
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deletingIds, setDeletingIds] = useState<Record<string, boolean>>({});
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 10;

    async function load() {
        setLoading(true);
        setError("");

        let q = supabase
            .from("rsvps")
            .select(
                "id, full_name, phone, guests, adults, kids, session, guest_of, message, created_at"
            );

        if (sessionFilter !== "All") q = q.eq("session", sessionFilter);
        if (guestOfFilter !== "All") q = q.eq("guest_of", guestOfFilter);
        if (sort === "newest") q = q.order("created_at", { ascending: false });
        if (sort === "oldest") q = q.order("created_at", { ascending: true });
        if (sort === "name_az") q = q.order("full_name", { ascending: true });

        const { data, error } = await q;

        if (error) {
            setError(error.message);
            setRows([]);
        } else {
            setRows((data ?? []) as RsvpRow[]);
        }
        setLoading(false);
    }

    useEffect(() => {
        setPage(1);
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sessionFilter, guestOfFilter, sort]);

    const totals = useMemo(() => {
        const submissions = rows.length;
        const totalGuests = rows.reduce((sum, r) => sum + (Number(r.guests) || 0), 0);
        const totalAdults = rows.reduce((sum, r) => sum + (Number(r.adults) || 0), 0);
        const totalKids = rows.reduce((sum, r) => sum + (Number(r.kids) || 0), 0);
        const session1 = rows.filter((r) => r.session === "Session 1").reduce((sum, r) => sum + (Number(r.guests) || 0), 0);
        const session2 = rows.filter((r) => r.session === "Session 2").reduce((sum, r) => sum + (Number(r.guests) || 0), 0);
        const session3 = rows.filter((r) => r.session === "Session 3").reduce((sum, r) => sum + (Number(r.guests) || 0), 0);
        const bride = rows.filter((r) => r.guest_of === "Bride").reduce((sum, r) => sum + (Number(r.guests) || 0), 0);
        const groom = rows.filter((r) => r.guest_of === "Groom").reduce((sum, r) => sum + (Number(r.guests) || 0), 0);
        return { submissions, totalGuests, totalAdults, totalKids, session1, session2, session3, bride, groom };
    }, [rows]);

    const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
    const paginatedRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    function exportCSV() {
        const headers = ["Full Name", "Phone", "Guests", "Adults", "Kids", "Session", "Guest Of", "Message", "Submitted At"];
        const lines = rows.map((r) => [
            r.full_name ?? "",
            r.phone ?? "",
            String(r.guests ?? 0),
            String(r.adults ?? 0),
            String(r.kids ?? 0),
            r.session ?? "",
            r.guest_of ?? "",
            r.message ?? "",
            new Date(r.created_at).toLocaleString(),
        ]);
        const csv = [headers, ...lines].map((row) => row.map(csvEscape).join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `rsvps_compact_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    }

    async function confirmDelete(id: string) {
        setDeletingIds((m) => ({ ...m, [id]: true }));
        setError("");
        const prev = rows;
        setRows((r) => r.filter((x) => x.id !== id));
        setDeleteId(null);
        const { error } = await supabase.from("rsvps").delete().eq("id", id);
        if (error) {
            setRows(prev);
            setError(`Delete failed: ${error.message}`);
        } else {
            await load();
        }
        setDeletingIds((m) => {
            const copy = { ...m };
            delete copy[id];
            return copy;
        });
    }

    const sessionColor: Record<string, string> = {
        "Session 1": "bg-amber-50 text-amber-800 border-amber-200",
        "Session 2": "bg-sky-50 text-sky-800 border-sky-200",
        "Session 3": "bg-violet-50 text-violet-800 border-violet-200",
    };

    const sessionDot: Record<string, string> = {
        "Session 1": "bg-amber-400",
        "Session 2": "bg-sky-400",
        "Session 3": "bg-violet-400",
    };

    const guestOfColor: Record<string, string> = {
        Bride: "bg-rose-50 text-rose-700 border-rose-200",
        Groom: "bg-slate-50 text-slate-700 border-slate-200",
    };

    return (
        <main className="min-h-screen bg-[#FBF7F2] text-zinc-800">
            {/* Background layer */}
            <div className="pointer-events-none fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-[radial-gradient(1200px_800px_at_10%_10%,rgba(122,0,34,0.08),transparent_60%),radial-gradient(900px_700px_at_90%_20%,rgba(0,0,0,0.05),transparent_55%)]" />
                <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-[#FBF7F2]/55 to-white/80" />
            </div>

            <div className="mx-auto max-w-4xl px-4 pb-16 pt-10 sm:px-6 sm:pt-14">

                {/* ── Header ── */}
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[#7A0022]/80">Admin</p>
                        <h1 className="mt-1 font-serif text-3xl font-semibold text-zinc-900">
                            RSVP List
                        </h1>
                        <p className="mt-1 text-sm text-zinc-500">
                            {loading ? "Loading…" : `${totals.submissions} submissions · ${totals.totalGuests} guests · Page ${page} of ${totalPages}`}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Link
                            href="/admin"
                            className="inline-flex items-center gap-1.5 rounded-full bg-[#7A0022] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#64001C] transition"
                        >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                            Card View
                        </Link>
                        <button
                            onClick={exportCSV}
                            disabled={rows.length === 0}
                            className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white/85 px-4 py-2 text-sm text-zinc-800 hover:bg-white disabled:opacity-40 transition"
                        >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            Export CSV
                        </button>
                        <button
                            onClick={load}
                            className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white/85 px-4 py-2 text-sm text-zinc-800 hover:bg-white transition"
                        >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                            Refresh
                        </button>
                    </div>
                </div>

                {/* ── Mini Stats ── */}
                <div className="mb-5 flex flex-wrap gap-2">
                    <MiniStat label="Total guests" value={totals.totalGuests} highlight />
                    <MiniStat label="Adults" value={totals.totalAdults} />
                    <MiniStat label="Kids" value={totals.totalKids} />
                    <div className="h-6 w-px bg-black/10 self-center mx-1" />
                    <MiniStat label="S1" value={totals.session1} dot="bg-amber-400" />
                    <MiniStat label="S2" value={totals.session2} dot="bg-sky-400" />
                    <MiniStat label="S3" value={totals.session3} dot="bg-violet-400" />
                    <div className="h-6 w-px bg-black/10 self-center mx-1" />
                    <MiniStat label="Bride" value={totals.bride} dot="bg-rose-400" />
                    <MiniStat label="Groom" value={totals.groom} dot="bg-slate-400" />
                </div>

                {/* ── Filters ── */}
                <div className="mb-4 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 mr-1">Filter</span>
                    {(["All", "Session 1", "Session 2", "Session 3"] as SessionFilter[]).map((s) => (
                        <button
                            key={s}
                            onClick={() => setSessionFilter(s)}
                            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${sessionFilter === s
                                ? "border-[#7A0022] bg-[#7A0022] text-white"
                                : "border-black/10 bg-white/70 text-zinc-600 hover:bg-white"
                                }`}
                        >
                            {s === "All" ? "All" : s}
                        </button>
                    ))}
                    <div className="h-4 w-px bg-black/10 mx-0.5" />
                    {(["All", "Bride", "Groom"] as GuestOfFilter[]).map((g) => (
                        <button
                            key={g}
                            onClick={() => setGuestOfFilter(g)}
                            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${guestOfFilter === g
                                ? "border-[#7A0022] bg-[#7A0022] text-white"
                                : "border-black/10 bg-white/70 text-zinc-600 hover:bg-white"
                                }`}
                        >
                            {g === "All" ? "Both" : g}
                        </button>
                    ))}
                    <div className="ml-auto">
                        <select
                            value={sort}
                            onChange={(e) => setSort(e.target.value as Sort)}
                            className="rounded-full border border-black/10 bg-white/85 px-3 py-1.5 text-xs text-zinc-700 hover:bg-white"
                        >
                            <option value="newest">Newest</option>
                            <option value="oldest">Oldest</option>
                            <option value="name_az">Name A–Z</option>
                        </select>
                    </div>
                </div>

                {/* ── Error ── */}
                {error && (
                    <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
                )}

                {/* ── List ── */}
                {loading ? (
                    <div className="flex flex-col gap-2">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="h-14 animate-pulse rounded-2xl border border-black/5 bg-white/60" />
                        ))}
                    </div>
                ) : rows.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-[28px] border border-black/5 bg-white/60 py-20 text-center">
                        <p className="text-sm font-medium text-zinc-400">No submissions found</p>
                        <p className="mt-1 text-xs text-zinc-300">Try adjusting your filters</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-1.5">
                        {paginatedRows.map((r, idx) => {
                            const isExpanded = expandedId === r.id;
                            const initials = (r.full_name ?? "?")
                                .split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
                            const hasMessage = r.message && r.message.trim().length > 0;

                            return (
                                <div
                                    key={r.id}
                                    className="overflow-hidden rounded-2xl border border-white/60 bg-white/80 shadow-[0_2px_12px_rgba(0,0,0,0.05)] backdrop-blur-sm transition-all duration-200"
                                >
                                    {/* ── Compact Row ── */}
                                    <button
                                        onClick={() => setExpandedId(isExpanded ? null : r.id)}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/60 transition"
                                    >
                                        {/* Session dot */}
                                        <span className={`h-2 w-2 shrink-0 rounded-full ${r.session ? sessionDot[r.session] : "bg-zinc-300"}`} />

                                        {/* Initials */}
                                        <div className="h-8 w-8 shrink-0 flex items-center justify-center rounded-full bg-[#7A0022]/10 text-[11px] font-bold text-[#7A0022]">
                                            {initials}
                                        </div>

                                        {/* Name + phone */}
                                        <div className="flex-1 min-w-0">
                                            <p className="truncate text-sm font-semibold text-zinc-900 leading-tight">
                                                {r.full_name || "—"}
                                            </p>
                                            <p className="text-[11px] text-zinc-400">{r.phone || "No phone"}</p>
                                        </div>

                                        {/* Badges */}
                                        <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                                            {r.session && (
                                                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${sessionColor[r.session]}`}>
                                                    {r.session}
                                                </span>
                                            )}
                                            {r.guest_of && (
                                                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${guestOfColor[r.guest_of]}`}>
                                                    {r.guest_of}
                                                </span>
                                            )}
                                        </div>

                                        {/* Guest counts */}
                                        <div className="flex items-center gap-2 shrink-0 text-right">
                                            <div className="flex items-center gap-1">
                                                <span className="text-xs text-zinc-400">👥</span>
                                                <span className="text-sm font-bold text-zinc-800">{r.guests ?? 0}</span>
                                            </div>
                                            <span className="text-zinc-200 text-xs">|</span>
                                            <div className="flex items-center gap-0.5 text-[11px] text-zinc-400">
                                                <span>{r.adults ?? 0}A</span>
                                                <span className="text-zinc-300">·</span>
                                                <span>{r.kids ?? 0}K</span>
                                            </div>
                                        </div>

                                        {/* Message indicator */}
                                        {hasMessage && (
                                            <svg className="h-3.5 w-3.5 shrink-0 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 16V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2h11l4 4-1-4h1a2 2 0 002-2z" />
                                            </svg>
                                        )}

                                        {/* Chevron */}
                                        <svg
                                            className={`h-3.5 w-3.5 shrink-0 text-zinc-300 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                                            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {/* ── Expanded Detail ── */}
                                    {isExpanded && (
                                        <div className="border-t border-black/5 bg-zinc-50/60 px-4 py-3 flex flex-col gap-3">

                                            {/* Mobile badges */}
                                            <div className="flex sm:hidden items-center gap-1.5">
                                                {r.session && (
                                                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${sessionColor[r.session]}`}>
                                                        {r.session}
                                                    </span>
                                                )}
                                                {r.guest_of && (
                                                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${guestOfColor[r.guest_of]}`}>
                                                        {r.guest_of}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Message */}
                                            {hasMessage && (
                                                <div className="rounded-xl border border-black/5 bg-white/70 px-3 py-2.5">
                                                    <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-1">Message</p>
                                                    <p className="text-sm italic text-zinc-600">&quot;{r.message?.trim()}&quot;</p>
                                                </div>
                                            )}

                                            {/* Submitted date + delete */}
                                            <div className="flex items-center justify-between">
                                                <p className="text-[11px] text-zinc-400">
                                                    Submitted{" "}
                                                    <span className="font-medium text-zinc-500">
                                                        {new Date(r.created_at).toLocaleString("en-MY", {
                                                            day: "numeric", month: "short", year: "numeric",
                                                            hour: "2-digit", minute: "2-digit",
                                                        })}
                                                    </span>
                                                </p>
                                                <button
                                                    onClick={() => setDeleteId(r.id)}
                                                    disabled={!!deletingIds[r.id]}
                                                    className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-[11px] font-semibold text-red-600 hover:bg-red-100 disabled:opacity-40 transition"
                                                >
                                                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    {deletingIds[r.id] ? "Deleting…" : "Delete"}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ── Pagination ── */}
                {!loading && rows.length > PAGE_SIZE && (
                    <div className="mt-6 flex items-center justify-center gap-2">
                        <button
                            onClick={() => { setPage((p) => Math.max(1, p - 1)); setExpandedId(null); }}
                            disabled={page === 1}
                            className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white/85 px-4 py-2 text-sm text-zinc-700 hover:bg-white disabled:opacity-30 transition"
                        >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                            Prev
                        </button>

                        <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                                const isActive = p === page;
                                const isNear = Math.abs(p - page) <= 1 || p === 1 || p === totalPages;
                                if (!isNear) {
                                    if (p === 2 && page > 3) return <span key={p} className="text-xs text-zinc-300 px-1">…</span>;
                                    if (p === totalPages - 1 && page < totalPages - 2) return <span key={p} className="text-xs text-zinc-300 px-1">…</span>;
                                    return null;
                                }
                                return (
                                    <button
                                        key={p}
                                        onClick={() => { setPage(p); setExpandedId(null); }}
                                        className={`h-8 w-8 rounded-full text-sm font-medium transition ${isActive
                                            ? "bg-[#7A0022] text-white shadow-sm"
                                            : "border border-black/10 bg-white/85 text-zinc-600 hover:bg-white"
                                            }`}
                                    >
                                        {p}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => { setPage((p) => Math.min(totalPages, p + 1)); setExpandedId(null); }}
                            disabled={page === totalPages}
                            className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white/85 px-4 py-2 text-sm text-zinc-700 hover:bg-white disabled:opacity-30 transition"
                        >
                            Next
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>
                )}
            </div>

            {/* ── Confirm Modal ── */}
            {deleteId && (
                <ConfirmModal
                    title="Delete RSVP?"
                    description="This will permanently remove this RSVP entry. This cannot be undone."
                    confirmText="Yes, delete"
                    cancelText="Cancel"
                    onCancel={() => setDeleteId(null)}
                    onConfirm={() => confirmDelete(deleteId)}
                />
            )}
        </main>
    );
}

/* ── Sub-components ── */

function MiniStat({ label, value, highlight, dot }: { label: string; value: number; highlight?: boolean; dot?: string }) {
    return (
        <div className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs ${highlight ? "border-[#7A0022]/20 bg-[#7A0022] text-white" : "border-black/8 bg-white/75 text-zinc-700"}`}>
            {dot && <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />}
            <span className={highlight ? "text-white/70" : "text-zinc-400"}>{label}</span>
            <span className="font-bold">{value}</span>
        </div>
    );
}

function ConfirmModal({
    title, description, confirmText, cancelText, onConfirm, onCancel,
}: {
    title: string; description: string; confirmText: string; cancelText: string;
    onConfirm: () => void; onCancel: () => void;
}) {
    return (
        <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
            <div className="absolute inset-0 grid place-items-center px-5">
                <div className="w-full max-w-sm rounded-[28px] border border-white/55 bg-white/90 p-7 shadow-[0_20px_70px_rgba(0,0,0,0.25)] backdrop-blur">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
                        <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    </div>
                    <p className="font-semibold text-zinc-900">{title}</p>
                    <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">{description}</p>
                    <div className="mt-6 flex gap-3">
                        <button onClick={onCancel} className="flex-1 rounded-full border border-black/10 bg-white px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50">
                            {cancelText}
                        </button>
                        <button onClick={onConfirm} className="flex-1 rounded-full bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700">
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function csvEscape(v: string) {
    const s = String(v ?? "");
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
}
