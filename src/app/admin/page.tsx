"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Session = "Public" | "Private";
type Filter = "All" | Session;
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
    created_at: string;
};

export default function AdminPage() {
    const [rows, setRows] = useState<RsvpRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<Filter>("All");
    const [sort, setSort] = useState<Sort>("newest");
    const [error, setError] = useState<string>("");

    // delete UX
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deletingIds, setDeletingIds] = useState<Record<string, boolean>>({});

    async function load() {
        setLoading(true);
        setError("");

        let q = supabase
            .from("rsvps")
            .select("id, full_name, phone, guests, adults, kids, session, created_at");

        if (filter !== "All") q = q.eq("session", filter);

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
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter, sort]);

    const totals = useMemo(() => {
        const submissions = rows.length;
        const totalGuests = rows.reduce((sum, r) => sum + (Number(r.guests) || 0), 0);
        const totalAdults = rows.reduce((sum, r) => sum + (Number(r.adults) || 0), 0);
        const totalKids = rows.reduce((sum, r) => sum + (Number(r.kids) || 0), 0);
        return { submissions, totalGuests, totalAdults, totalKids };
    }, [rows]);

    function exportCSV() {
        const headers = ["Full Name", "Phone", "Guests", "Adults", "Kids", "Session", "Submitted At"];

        const lines = rows.map((r) => [
            r.full_name ?? "",
            r.phone ?? "",
            String(r.guests ?? 0),
            String(r.adults ?? 0),
            String(r.kids ?? 0),
            r.session ?? "",
            new Date(r.created_at).toLocaleString(),
        ]);

        const csv = [headers, ...lines].map((row) => row.map(csvEscape).join(",")).join("\n");

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `rsvps_${filter.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    }

    async function confirmDelete(id: string) {
        setDeletingIds((m) => ({ ...m, [id]: true }));
        setError("");

        // optimistic remove
        const prev = rows;
        setRows((r) => r.filter((x) => x.id !== id));
        setDeleteId(null);

        const { error } = await supabase.from("rsvps").delete().eq("id", id);

        if (error) {
            // rollback if failed
            setRows(prev);
            setError(`Delete failed: ${error.message}`);
        }

        setDeletingIds((m) => {
            const copy = { ...m };
            delete copy[id];
            return copy;
        });
    }

    return (
        <main className="min-h-screen bg-[#FBF7F2] text-zinc-800">
            {/* subtle admin background like site */}
            <div className="pointer-events-none fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-[radial-gradient(1200px_800px_at_10%_10%,rgba(122,0,34,0.08),transparent_60%),radial-gradient(900px_700px_at_90%_20%,rgba(0,0,0,0.05),transparent_55%)]" />
                <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-[#FBF7F2]/55 to-white/80" />
            </div>

            <div className="mx-auto max-w-6xl px-5 pb-14 pt-10 sm:px-6 sm:pt-14">
                <div className="rounded-[28px] border border-white/55 bg-white/65 p-6 shadow-[0_20px_70px_rgba(0,0,0,0.10)] sm:p-10">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[#7A0022]/80">
                                Admin
                            </p>
                            <h1 className="mt-2 font-serif text-3xl font-semibold text-zinc-900 sm:text-4xl">
                                RSVP Dashboard
                            </h1>
                            <p className="mt-2 text-sm text-zinc-600">
                                View submissions, filter by session, export, and manage entries.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <Link
                                href="/admin/messages"
                                className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white/85 px-5 py-3 text-sm text-zinc-900 hover:bg-white"
                            >
                                Manage Messages
                            </Link>

                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value as Filter)}
                                className="rounded-full border border-black/10 bg-white/85 px-5 py-3 text-sm text-zinc-900 hover:bg-white"
                            >
                                <option value="All">All Sessions</option>
                                <option value="Public">Public Only</option>
                                <option value="Private">Private Only</option>
                            </select>

                            <select
                                value={sort}
                                onChange={(e) => setSort(e.target.value as Sort)}
                                className="rounded-full border border-black/10 bg-white/85 px-5 py-3 text-sm text-zinc-900 hover:bg-white"
                            >
                                <option value="newest">Newest first</option>
                                <option value="oldest">Oldest first</option>
                                <option value="name_az">Name (A–Z)</option>
                            </select>

                            <button
                                onClick={exportCSV}
                                className="rounded-full bg-[#7A0022] px-5 py-3 text-sm font-medium text-white shadow-[0_12px_26px_rgba(122,0,34,0.18)] hover:bg-[#64001C] disabled:opacity-50"
                                disabled={rows.length === 0}
                            >
                                Export CSV
                            </button>

                            <button
                                onClick={load}
                                className="rounded-full border border-black/10 bg-white/85 px-5 py-3 text-sm text-zinc-900 hover:bg-white"
                            >
                                Refresh
                            </button>
                        </div>
                    </div>

                    {/* Totals */}
                    <div className="mt-6 grid gap-4 sm:grid-cols-4">
                        <StatCard label="Total submissions" value={totals.submissions} />
                        <StatCard label="Total guests" value={totals.totalGuests} />
                        <StatCard label="Total adults" value={totals.totalAdults} />
                        <StatCard label="Total kids" value={totals.totalKids} />
                    </div>

                    {/* Errors */}
                    {error && (
                        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    {/* Table */}
                    <div className="mt-6 overflow-hidden rounded-[28px] border border-black/10 bg-white/80 shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1080px] text-left text-sm">
                                <thead className="bg-white/60 text-zinc-600">
                                    <tr className="border-b border-black/5">
                                        <th className="px-5 py-4">Name</th>
                                        <th className="px-5 py-4">Phone</th>
                                        <th className="px-5 py-4">Guests</th>
                                        <th className="px-5 py-4">Adults</th>
                                        <th className="px-5 py-4">Kids</th>
                                        <th className="px-5 py-4">Session</th>
                                        <th className="px-5 py-4">Submitted</th>
                                        <th className="px-5 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td className="px-5 py-6 text-zinc-600" colSpan={8}>
                                                Loading...
                                            </td>
                                        </tr>
                                    ) : rows.length === 0 ? (
                                        <tr>
                                            <td className="px-5 py-6 text-zinc-600" colSpan={8}>
                                                No submissions found.
                                            </td>
                                        </tr>
                                    ) : (
                                        rows.map((r) => (
                                            <tr key={r.id} className="border-t border-black/5">
                                                <td className="px-5 py-4 font-medium text-zinc-900">
                                                    {r.full_name || "-"}
                                                </td>

                                                <td className="px-5 py-4 text-zinc-700">{r.phone || "-"}</td>
                                                <td className="px-5 py-4 text-zinc-700">{r.guests ?? 0}</td>
                                                <td className="px-5 py-4 text-zinc-700">{r.adults ?? 0}</td>
                                                <td className="px-5 py-4 text-zinc-700">{r.kids ?? 0}</td>

                                                <td className="px-5 py-4">
                                                    <span className="inline-flex rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs font-medium text-zinc-700">
                                                        {r.session ?? "-"}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4 text-zinc-600">
                                                    {new Date(r.created_at).toLocaleString()}
                                                </td>

                                                <td className="px-5 py-4 text-right">
                                                    <button
                                                        onClick={() => setDeleteId(r.id)}
                                                        disabled={!!deletingIds[r.id]}
                                                        className="inline-flex items-center justify-center rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
                                                    >
                                                        {deletingIds[r.id] ? "Deleting..." : "Delete"}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Delete confirm modal */}
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
                </div>
            </div>
        </main>
    );
}

function StatCard({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-3xl border border-black/10 bg-white/75 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.30em] text-zinc-600">
                {label}
            </p>
            <p className="mt-2 text-3xl font-semibold text-zinc-900">{value}</p>
        </div>
    );
}

function ConfirmModal({
    title,
    description,
    confirmText,
    cancelText,
    onConfirm,
    onCancel,
}: {
    title: string;
    description: string;
    confirmText: string;
    cancelText: string;
    onConfirm: () => void;
    onCancel: () => void;
}) {
    return (
        <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
            <div className="absolute inset-0 grid place-items-center px-5">
                <div className="w-full max-w-md rounded-[28px] border border-white/55 bg-white/85 p-6 shadow-[0_20px_70px_rgba(0,0,0,0.25)] backdrop-blur sm:p-8">
                    <p className="text-sm font-semibold text-zinc-900">{title}</p>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-600">{description}</p>

                    <div className="mt-6 flex gap-3">
                        <button
                            onClick={onCancel}
                            className="flex-1 rounded-full border border-black/10 bg-white px-4 py-2.5 text-sm text-zinc-900 hover:bg-zinc-50"
                        >
                            {cancelText}
                        </button>

                        <button
                            onClick={onConfirm}
                            className="flex-1 rounded-full bg-[#7A0022] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#64001C]"
                        >
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