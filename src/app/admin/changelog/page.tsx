"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Tag = "Feature" | "Fix" | "Improvement" | "Design";

type LogEntry = {
    id: string;
    date: string;
    tag: Tag;
    title: string;
    description: string;
};

const TAG_COLORS: Record<Tag, string> = {
    Feature: "bg-emerald-100 text-emerald-800 border-emerald-200",
    Fix: "bg-red-100 text-red-800 border-red-200",
    Improvement: "bg-sky-100 text-sky-800 border-sky-200",
    Design: "bg-violet-100 text-violet-800 border-violet-200",
};

const TAGS: Tag[] = ["Feature", "Fix", "Improvement", "Design"];

function formatDate(iso: string) {
    return new Date(iso + "T00:00:00").toLocaleDateString("en-MY", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

export default function ChangelogPage() {
    const [entries, setEntries] = useState<LogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const [form, setForm] = useState({
        date: new Date().toISOString().slice(0, 10),
        tag: "Feature" as Tag,
        title: "",
        description: "",
    });

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        const { data, error: err } = await supabase
            .from("update_logs")
            .select("*")
            .order("date", { ascending: false })
            .order("created_at", { ascending: false });
        if (err) setError(err.message);
        else setEntries(data ?? []);
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!form.title.trim() || !form.description.trim()) return;
        setSaving(true);
        const { error: err } = await supabase.from("update_logs").insert({
            date: form.date,
            tag: form.tag,
            title: form.title.trim(),
            description: form.description.trim(),
        });
        setSaving(false);
        if (err) { setError(err.message); return; }
        setForm({ date: new Date().toISOString().slice(0, 10), tag: "Feature", title: "", description: "" });
        setShowForm(false);
        load();
    }

    async function handleDelete(id: string) {
        setDeletingId(id);
        await supabase.from("update_logs").delete().eq("id", id);
        setDeletingId(null);
        setEntries((prev) => prev.filter((e) => e.id !== id));
    }

    const grouped = entries.reduce<Record<string, LogEntry[]>>((acc, e) => {
        acc[e.date] = [...(acc[e.date] ?? []), e];
        return acc;
    }, {});
    const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

    return (
        <main className="min-h-screen bg-[#FBF7F2] text-zinc-800">
            <div className="pointer-events-none fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-[radial-gradient(1200px_800px_at_10%_10%,rgba(122,0,34,0.08),transparent_60%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(900px_600px_at_90%_80%,rgba(122,0,34,0.05),transparent_60%)]" />
            </div>

            <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">

                {/* Header */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[#7A0022]/80">Admin</p>
                        <h1 className="mt-1 font-serif text-3xl font-semibold text-zinc-900 sm:text-4xl">Update Log</h1>
                        <p className="mt-1 text-sm text-zinc-500">
                            {loading ? "Loading…" : `${entries.length} update${entries.length !== 1 ? "s" : ""}`}
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
                            onClick={() => setShowForm((v) => !v)}
                            className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white/85 px-4 py-2.5 text-sm text-zinc-700 hover:bg-white transition"
                        >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d={showForm ? "M6 18L18 6M6 6l12 12" : "M12 4v16m8-8H4"} />
                            </svg>
                            {showForm ? "Cancel" : "Add Entry"}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
                )}

                {/* Add form */}
                {showForm && (
                    <form onSubmit={handleSubmit} className="mb-8 rounded-3xl border border-black/10 bg-white/80 p-5 shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
                        <p className="mb-4 text-sm font-semibold text-zinc-800">New Entry</p>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Date</label>
                                <input
                                    type="date"
                                    value={form.date}
                                    onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                                    className="w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm text-zinc-800 outline-none focus:border-[#7A0022]/40 focus:ring-2 focus:ring-[#7A0022]/10"
                                    required
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Tag</label>
                                <select
                                    value={form.tag}
                                    onChange={(e) => setForm((f) => ({ ...f, tag: e.target.value as Tag }))}
                                    className="w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm text-zinc-800 outline-none focus:border-[#7A0022]/40 focus:ring-2 focus:ring-[#7A0022]/10"
                                >
                                    {TAGS.map((t) => <option key={t}>{t}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="mt-3">
                            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Title</label>
                            <input
                                type="text"
                                value={form.title}
                                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                                placeholder="e.g. Fixed RSVP form bug"
                                className="w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm text-zinc-800 outline-none focus:border-[#7A0022]/40 focus:ring-2 focus:ring-[#7A0022]/10"
                                required
                            />
                        </div>
                        <div className="mt-3">
                            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Description</label>
                            <textarea
                                value={form.description}
                                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                                placeholder="What was changed and why…"
                                rows={3}
                                className="w-full resize-none rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm text-zinc-800 outline-none focus:border-[#7A0022]/40 focus:ring-2 focus:ring-[#7A0022]/10"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={saving}
                            className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#7A0022] px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#64001C] disabled:opacity-50 transition"
                        >
                            {saving ? "Saving…" : "Save Entry"}
                        </button>
                    </form>
                )}

                {/* Entries */}
                {loading ? (
                    <div className="space-y-6">
                        {[1, 2].map((i) => (
                            <div key={i} className="space-y-2">
                                <div className="h-4 w-40 animate-pulse rounded-full bg-zinc-200" />
                                <div className="h-14 animate-pulse rounded-2xl bg-zinc-100" />
                                <div className="h-14 animate-pulse rounded-2xl bg-zinc-100" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-8">
                        {sortedDates.map((date) => (
                            <div key={date}>
                                <div className="mb-3 flex items-center gap-3">
                                    <span className="font-serif text-sm font-semibold text-zinc-900">{formatDate(date)}</span>
                                    <span className="h-px flex-1 bg-black/8" />
                                    <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                                        {grouped[date].length} update{grouped[date].length !== 1 ? "s" : ""}
                                    </span>
                                </div>
                                <div className="space-y-2.5">
                                    {grouped[date].map((entry) => (
                                        <div
                                            key={entry.id}
                                            className="group rounded-[20px] border border-black/10 bg-white/75 px-5 py-4 shadow-[0_4px_16px_rgba(0,0,0,0.04)]"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex items-center gap-2">
                                                    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${TAG_COLORS[entry.tag]}`}>
                                                        {entry.tag}
                                                    </span>
                                                    <p className="text-sm font-semibold text-zinc-900">{entry.title}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleDelete(entry.id)}
                                                    disabled={deletingId === entry.id}
                                                    className="shrink-0 opacity-0 group-hover:opacity-100 rounded-full p-1 text-zinc-300 hover:text-red-500 hover:bg-red-50 transition"
                                                >
                                                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                            <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">{entry.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {entries.length === 0 && (
                            <div className="rounded-[20px] border border-black/10 bg-white/70 p-8 text-center text-sm text-zinc-400">
                                No entries yet. Click &quot;Add Entry&quot; to get started.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}
