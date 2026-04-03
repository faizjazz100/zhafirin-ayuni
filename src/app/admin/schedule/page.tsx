"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ScheduleItem } from "@/lib/schedule";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const emptyItem = (): Omit<ScheduleItem, "id" | "sort_order"> => ({
    time: "",
    title: "",
    details: [],
    show_in_preview: false,
});

export default function EditSchedulePage() {
    const [items, setItems] = useState<ScheduleItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [newItem, setNewItem] = useState(emptyItem());
    const [adding, setAdding] = useState(false);
    const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

    function showToast(msg: string, ok = true) {
        setToast({ msg, ok });
        setTimeout(() => setToast(null), 3000);
    }

    useEffect(() => {
        let cancelled = false;

        async function load() {
            setLoading(true);
            const { data } = await supabase
                .from("schedule")
                .select("*")
                .order("sort_order", { ascending: true });
            if (!cancelled) {
                setItems(data ?? []);
                setLoading(false);
            }
        }

        load();

        return () => { cancelled = true; };
    }, []);

    async function saveItem(item: ScheduleItem) {
        setSaving(item.id);
        const { error } = await supabase
            .from("schedule")
            .update({
                time: item.time,
                title: item.title,
                details: item.details,
                show_in_preview: item.show_in_preview,
            })
            .eq("id", item.id);
        setSaving(null);
        if (error) showToast("Failed to save.", false);
        else showToast("Saved!");
    }

    async function deleteItem(id: string) {
        if (!confirm("Delete this item?")) return;
        setDeleting(id);
        const { error } = await supabase.from("schedule").delete().eq("id", id);
        if (error) { showToast("Failed to delete.", false); setDeleting(null); return; }
        setItems((prev) => prev.filter((i) => i.id !== id));
        setDeleting(null);
        showToast("Deleted.");
    }

    async function addItem() {
        if (!newItem.time || !newItem.title) return;
        setAdding(true);
        const sort_order = items.length > 0
            ? Math.max(...items.map((i) => i.sort_order)) + 1
            : 0;
        const { data, error } = await supabase
            .from("schedule")
            .insert({ ...newItem, sort_order })
            .select()
            .single();
        setAdding(false);
        if (error || !data) { showToast("Failed to add.", false); return; }
        setItems((prev) => [...prev, data]);
        setNewItem(emptyItem());
        showToast("Item added!");
    }

    async function moveItem(index: number, direction: "up" | "down") {
        const swapIndex = direction === "up" ? index - 1 : index + 1;
        if (swapIndex < 0 || swapIndex >= items.length) return;

        const updated = [...items];
        const a = { ...updated[index], sort_order: updated[swapIndex].sort_order };
        const b = { ...updated[swapIndex], sort_order: updated[index].sort_order };
        updated[index] = a;
        updated[swapIndex] = b;
        updated.sort((x, y) => x.sort_order - y.sort_order);
        setItems(updated);

        await supabase.from("schedule").update({ sort_order: a.sort_order }).eq("id", a.id);
        await supabase.from("schedule").update({ sort_order: b.sort_order }).eq("id", b.id);
    }

    function updateField<K extends keyof ScheduleItem>(
        id: string,
        field: K,
        value: ScheduleItem[K]
    ) {
        setItems((prev) =>
            prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
        );
    }

    return (
        <main className="min-h-screen bg-[#FBF7F2] px-4 py-10">
            {/* Background */}
            <div className="pointer-events-none fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-[radial-gradient(1200px_800px_at_10%_10%,rgba(122,0,34,0.10),transparent_60%),radial-gradient(900px_700px_at_90%_20%,rgba(176,16,62,0.08),transparent_55%)]" />
                <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-[#FBF7F2]/55 to-white/80" />
            </div>

            <div className="mx-auto max-w-2xl">
                {/* ── Header ── */}
                <div className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[#7A0022]/80">
                            Admin
                        </p>
                        <h1 className="mt-1 font-serif text-3xl font-semibold text-zinc-900 sm:text-4xl">
                            Edit Schedule
                        </h1>
                        <p className="mt-1 text-sm text-zinc-500">
                            Changes save to Supabase when you press Save.{" "}
                            <span className="font-medium text-zinc-700">Home</span> toggle controls
                            what appears on the home page preview.
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
                    </div>
                </div>

                {/* Toast */}
                <AnimatePresence>
                    {toast && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className={`mb-4 rounded-2xl px-4 py-3 text-sm font-medium border ${toast.ok
                                ? "bg-green-50 text-green-800 border-green-200"
                                : "bg-red-50 text-red-800 border-red-200"
                                }`}
                        >
                            {toast.msg}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Legend */}
                <div className="mb-4 flex items-center gap-2 rounded-2xl border border-black/10 bg-white/60 px-4 py-3">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-[#7A0022]/10 text-[10px] font-bold text-[#7A0022]">H</span>
                    <p className="text-xs text-zinc-500">
                        <span className="font-medium text-zinc-700">Home toggle</span> — tick to show this item in the Schedule Preview on the home page.
                    </p>
                </div>

                {/* Items */}
                {loading ? (
                    <div className="py-16 text-center text-sm text-zinc-400">Loading…</div>
                ) : items.length === 0 ? (
                    <div className="py-16 text-center text-sm text-zinc-400">No items yet. Add one below.</div>
                ) : (
                    <div className="space-y-3">
                        {items.map((item, i) => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="rounded-2xl border border-black/10 bg-white/80 px-5 py-4 shadow-sm"
                            >
                                <div className="flex items-start gap-3">
                                    {/* Reorder buttons */}
                                    <div className="flex flex-col gap-1 pt-1">
                                        <button
                                            onClick={() => moveItem(i, "up")}
                                            disabled={i === 0}
                                            className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 disabled:opacity-20"
                                            title="Move up"
                                        >
                                            ▲
                                        </button>
                                        <button
                                            onClick={() => moveItem(i, "down")}
                                            disabled={i === items.length - 1}
                                            className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 disabled:opacity-20"
                                            title="Move down"
                                        >
                                            ▼
                                        </button>
                                    </div>

                                    {/* Fields */}
                                    <div className="flex flex-1 flex-col gap-2">
                                        <div className="flex flex-col gap-2 sm:flex-row">
                                            <input
                                                value={item.time}
                                                onChange={(e) => updateField(item.id, "time", e.target.value)}
                                                placeholder="Time (e.g. 3:00 PM)"
                                                className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-zinc-800 outline-none focus:ring-2 focus:ring-[#7A0022]/30 sm:w-32"
                                            />
                                            <input
                                                value={item.title}
                                                onChange={(e) => updateField(item.id, "title", e.target.value)}
                                                placeholder="Event title"
                                                className="flex-1 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-zinc-800 outline-none focus:ring-2 focus:ring-[#7A0022]/30"
                                            />
                                        </div>

                                        {/* Home preview toggle */}
                                        <label className="flex cursor-pointer items-center gap-2 self-start rounded-xl border border-black/10 bg-white px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-50">
                                            <input
                                                type="checkbox"
                                                checked={item.show_in_preview ?? false}
                                                onChange={(e) =>
                                                    updateField(item.id, "show_in_preview", e.target.checked)
                                                }
                                                className="accent-[#7A0022]"
                                            />
                                            Show on Home
                                        </label>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col gap-2">
                                        <button
                                            onClick={() => saveItem(item)}
                                            disabled={saving === item.id}
                                            className="rounded-xl bg-[#7A0022] px-3 py-2 text-xs font-medium text-white hover:bg-[#64001C] disabled:opacity-50"
                                        >
                                            {saving === item.id ? "…" : "Save"}
                                        </button>
                                        <button
                                            onClick={() => deleteItem(item.id)}
                                            disabled={deleting === item.id}
                                            className="rounded-xl border border-red-200 px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-50 disabled:opacity-50"
                                        >
                                            {deleting === item.id ? "…" : "Delete"}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Add new item */}
                <div className="mt-6 rounded-2xl border border-dashed border-black/15 bg-white/60 px-5 py-5">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-400">
                        Add New Item
                    </p>
                    <div className="flex flex-col gap-2">
                        <div className="flex flex-col gap-2 sm:flex-row">
                            <input
                                value={newItem.time}
                                onChange={(e) => setNewItem((p) => ({ ...p, time: e.target.value }))}
                                placeholder="e.g. 3:00 PM"
                                className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#7A0022]/30 sm:w-32"
                            />
                            <input
                                value={newItem.title}
                                onChange={(e) => setNewItem((p) => ({ ...p, title: e.target.value }))}
                                placeholder="Event title"
                                className="flex-1 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#7A0022]/30"
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-black/10 bg-white px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-50">
                                <input
                                    type="checkbox"
                                    checked={newItem.show_in_preview}
                                    onChange={(e) => setNewItem((p) => ({ ...p, show_in_preview: e.target.checked }))}
                                    className="accent-[#7A0022]"
                                />
                                Show on Home
                            </label>
                            <button
                                onClick={addItem}
                                disabled={adding || !newItem.time || !newItem.title}
                                className="rounded-xl bg-[#7A0022] px-5 py-2 text-sm font-medium text-white hover:bg-[#64001C] disabled:opacity-40"
                            >
                                {adding ? "Adding…" : "+ Add"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main >
    );
}