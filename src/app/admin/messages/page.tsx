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
            .select(
                "id, full_name, message, show_message, created_at, display_order"
            )
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

        return () => {
            cancelled = true;
        };
    }, []);

    const visible = useMemo(() => {
        if (filter === "all") return rows;
        if (filter === "featured") {
            return rows.filter((r) => r.show_message === true);
        }
        return rows.filter((r) => r.show_message !== true);
    }, [rows, filter]);

    const counts = useMemo(() => {
        const total = rows.length;
        const featured = rows.filter((r) => r.show_message === true).length;
        return { total, featured };
    }, [rows]);

    return (
        <main className="min-h-screen px-5 pb-14 text-zinc-800">
            <div className="mx-auto max-w-6xl pt-8">
                <div className="rounded-[28px] border border-zinc-200 bg-white p-6 shadow-sm sm:p-10">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">
                                Admin
                            </p>
                            <h1 className="mt-2 font-serif text-3xl font-semibold sm:text-4xl">
                                Message Manager
                            </h1>
                            <p className="mt-2 text-sm text-zinc-600">
                                Toggle Featured to show messages on the homepage carousel, and
                                set the order you want.
                            </p>

                            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
                                <Link
                                    href="/admin"
                                    className="inline-flex items-center justify-center rounded-full bg-[#7A0022] px-5 py-3 text-sm font-medium text-white shadow-sm hover:bg-[#64001C] transition"
                                >
                                    Back to RSVP Dashboard
                                </Link>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value as MsgFilter)}
                                className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm"
                            >
                                <option value="all">All messages</option>
                                <option value="featured">Featured only</option>
                                <option value="hidden">Hidden only</option>
                            </select>

                            <button
                                type="button"
                                onClick={() => void load()}
                                className="rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm hover:bg-zinc-50"
                            >
                                Refresh
                            </button>
                        </div>
                    </div>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                        <StatCard label="Total messages" value={counts.total} />
                        <StatCard label="Featured on homepage" value={counts.featured} />
                    </div>

                    {error && (
                        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <div className="mt-6 overflow-hidden rounded-3xl border border-zinc-200">
                        <div className="overflow-x-auto bg-white">
                            <table className="w-full min-w-[1100px] text-left text-sm">
                                <thead className="bg-zinc-50 text-zinc-600">
                                    <tr>
                                        <th className="px-5 py-4">Order</th>
                                        <th className="px-5 py-4">Name</th>
                                        <th className="px-5 py-4">Message</th>
                                        <th className="px-5 py-4">Featured</th>
                                        <th className="px-5 py-4">Submitted</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td className="px-5 py-6 text-zinc-600" colSpan={5}>
                                                Loading...
                                            </td>
                                        </tr>
                                    ) : visible.length === 0 ? (
                                        <tr>
                                            <td className="px-5 py-6 text-zinc-600" colSpan={5}>
                                                No messages found.
                                            </td>
                                        </tr>
                                    ) : (
                                        visible.map((r) => (
                                            <tr
                                                key={r.id}
                                                className="border-t border-zinc-100 align-top"
                                            >
                                                <td className="px-5 py-4">
                                                    <select
                                                        value={r.display_order ?? ""}
                                                        disabled={savingId === r.id}
                                                        onChange={(e) => updateOrder(r.id, e.target.value)}
                                                        className="w-24 rounded-xl border border-zinc-300 px-3 py-2 text-sm"
                                                    >
                                                        <option value="">Auto</option>
                                                        {Array.from({ length: 10 }).map((_, i) => (
                                                            <option key={i + 1} value={i + 1}>
                                                                {i + 1}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <p className="mt-2 text-xs text-zinc-500">
                                                        1 = first
                                                    </p>
                                                </td>

                                                <td className="px-5 py-4 font-medium text-zinc-900">
                                                    {r.full_name || "-"}
                                                </td>

                                                <td className="px-5 py-4 text-zinc-700">
                                                    <div className="max-w-[560px] whitespace-pre-wrap leading-relaxed">
                                                        {r.message}
                                                    </div>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <label className="inline-flex items-center gap-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={r.show_message === true}
                                                            disabled={savingId === r.id}
                                                            onChange={(e) =>
                                                                void setFeatured(r.id, e.target.checked)
                                                            }
                                                            className="h-5 w-5 accent-black"
                                                        />
                                                        <span className="text-sm text-zinc-700">
                                                            {r.show_message === true ? "Yes" : "No"}
                                                        </span>
                                                    </label>

                                                    {savingId === r.id ? (
                                                        <div className="mt-2 text-xs text-zinc-500">
                                                            Saving...
                                                        </div>
                                                    ) : null}
                                                </td>

                                                <td className="px-5 py-4 text-zinc-600">
                                                    {new Date(r.created_at).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <style jsx global>{`
            .font-serif {
              font-family: var(--font-serif), ui-serif, Georgia, serif;
            }
          `}</style>
                </div>
            </div>
        </main>
    );
}

function StatCard({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-3xl border border-zinc-200 bg-[#fbf7f3] p-6">
            <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">
                {label}
            </p>
            <p className="mt-2 text-3xl font-semibold text-zinc-900">{value}</p>
        </div>
    );
}