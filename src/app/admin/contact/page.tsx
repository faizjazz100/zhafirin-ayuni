"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

type ContactRow = {
    id: number;
    name: string;
    phone_display: string;
    phone_e164: string;
    display_order: number;
};

const emptyContact = (): Omit<ContactRow, "id"> => ({
    name: "",
    phone_display: "",
    phone_e164: "",
    display_order: 0,
});

export default function AdminContactPage() {
    const [rows, setRows] = useState<ContactRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<number | null>(null);
    const [deleting, setDeleting] = useState<number | null>(null);
    const [newContact, setNewContact] = useState(emptyContact());
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
                .from("contacts")
                .select("*")
                .order("display_order", { ascending: true });
            if (!cancelled) {
                setRows(data ?? []);
                setLoading(false);
            }
        }
        load();
        return () => { cancelled = true; };
    }, []);

    function updateLocal(id: number, field: keyof ContactRow, value: string | number) {
        setRows((prev) =>
            prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
        );
    }

    async function saveRow(row: ContactRow) {
        setSaving(row.id);
        const { error } = await supabase
            .from("contacts")
            .update({
                name: row.name,
                phone_display: row.phone_display,
                phone_e164: row.phone_e164,
                display_order: row.display_order,
            })
            .eq("id", row.id);
        setSaving(null);
        if (error) showToast("Failed to save.", false);
        else showToast("Saved!");
    }

    async function deleteRow(id: number) {
        if (!confirm("Delete this contact?")) return;
        setDeleting(id);
        const { error } = await supabase.from("contacts").delete().eq("id", id);
        if (error) { showToast("Failed to delete.", false); setDeleting(null); return; }
        setRows((prev) => prev.filter((r) => r.id !== id));
        setDeleting(null);
        showToast("Deleted.");
    }

    async function addContact() {
        if (!newContact.name || !newContact.phone_display || !newContact.phone_e164) return;
        setAdding(true);
        const display_order =
            rows.length > 0 ? Math.max(...rows.map((r) => r.display_order)) + 1 : 1;
        const { data, error } = await supabase
            .from("contacts")
            .insert({ ...newContact, display_order })
            .select()
            .single();
        setAdding(false);
        if (error || !data) { showToast("Failed to add.", false); return; }
        setRows((prev) => [...prev, data]);
        setNewContact(emptyContact());
        showToast("Contact added!");
    }

    return (
        <main className="min-h-screen bg-[#FBF7F2] text-zinc-800">
            <div className="pointer-events-none fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-[radial-gradient(1200px_800px_at_10%_10%,rgba(122,0,34,0.10),transparent_60%)]" />
            </div>

            {/* Toast */}
            {toast && (
                <div
                    className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full px-5 py-2.5 text-sm font-medium text-white shadow-lg transition ${
                        toast.ok ? "bg-emerald-600" : "bg-red-600"
                    }`}
                >
                    {toast.msg}
                </div>
            )}

            <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
                {/* Header */}
                <div className="mb-8 flex items-start justify-between gap-4">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[#7A0022]/80">
                            Admin
                        </p>
                        <h1 className="mt-1 font-serif text-3xl font-semibold text-zinc-900 sm:text-4xl">
                            Contact Manager
                        </h1>
                        <p className="mt-1 text-sm text-zinc-500">
                            Edit the contacts shown on the Contact page.
                        </p>
                    </div>
                    <Link
                        href="/admin"
                        className="shrink-0 rounded-full border border-black/10 bg-white/85 px-4 py-2 text-sm text-zinc-700 hover:bg-white transition"
                    >
                        ← Dashboard
                    </Link>
                </div>

                {/* Contact list */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="rounded-[20px] border border-black/10 bg-white/70 p-6 text-sm text-zinc-400">
                            Loading…
                        </div>
                    ) : rows.length === 0 ? (
                        <div className="rounded-[20px] border border-black/10 bg-white/70 p-6 text-sm text-zinc-400">
                            No contacts found. Add one below.
                        </div>
                    ) : (
                        rows.map((row) => (
                            <div
                                key={row.id}
                                className="rounded-[20px] border border-black/10 bg-white/75 p-5 shadow-[0_8px_24px_rgba(0,0,0,0.06)]"
                            >
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.28em] text-zinc-400">
                                            Name
                                        </label>
                                        <input
                                            type="text"
                                            value={row.name}
                                            onChange={(e) => updateLocal(row.id, "name", e.target.value)}
                                            className="w-full rounded-xl border border-black/10 bg-white/90 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-[#7A0022]/50 focus:ring-2 focus:ring-[#7A0022]/10"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.28em] text-zinc-400">
                                            Display (e.g. 013-355 2455)
                                        </label>
                                        <input
                                            type="text"
                                            value={row.phone_display}
                                            onChange={(e) => updateLocal(row.id, "phone_display", e.target.value)}
                                            className="w-full rounded-xl border border-black/10 bg-white/90 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-[#7A0022]/50 focus:ring-2 focus:ring-[#7A0022]/10"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.28em] text-zinc-400">
                                            E.164 (e.g. 60133552455)
                                        </label>
                                        <input
                                            type="text"
                                            value={row.phone_e164}
                                            onChange={(e) => updateLocal(row.id, "phone_e164", e.target.value)}
                                            className="w-full rounded-xl border border-black/10 bg-white/90 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-[#7A0022]/50 focus:ring-2 focus:ring-[#7A0022]/10"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.28em] text-zinc-400">
                                            Order
                                        </label>
                                        <input
                                            type="number"
                                            value={row.display_order}
                                            onChange={(e) => updateLocal(row.id, "display_order", Number(e.target.value))}
                                            className="w-full rounded-xl border border-black/10 bg-white/90 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-[#7A0022]/50 focus:ring-2 focus:ring-[#7A0022]/10"
                                        />
                                    </div>
                                </div>

                                <div className="mt-4 flex gap-2">
                                    <button
                                        onClick={() => saveRow(row)}
                                        disabled={saving === row.id}
                                        className="inline-flex items-center rounded-xl bg-[#7A0022] px-4 py-2 text-sm font-medium text-white hover:bg-[#64001C] disabled:opacity-50 transition"
                                    >
                                        {saving === row.id ? "Saving…" : "Save"}
                                    </button>
                                    <button
                                        onClick={() => deleteRow(row.id)}
                                        disabled={deleting === row.id}
                                        className="inline-flex items-center rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 hover:bg-red-100 disabled:opacity-50 transition"
                                    >
                                        {deleting === row.id ? "Deleting…" : "Delete"}
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Add new contact */}
                <div className="mt-8 rounded-[20px] border border-dashed border-[#7A0022]/30 bg-white/50 p-5">
                    <p className="mb-4 text-sm font-semibold text-zinc-700">Add Contact</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.28em] text-zinc-400">
                                Name
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Mai (Groom's)"
                                value={newContact.name}
                                onChange={(e) => setNewContact((p) => ({ ...p, name: e.target.value }))}
                                className="w-full rounded-xl border border-black/10 bg-white/90 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-[#7A0022]/50 focus:ring-2 focus:ring-[#7A0022]/10"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.28em] text-zinc-400">
                                Display
                            </label>
                            <input
                                type="text"
                                placeholder="013-355 2455"
                                value={newContact.phone_display}
                                onChange={(e) => setNewContact((p) => ({ ...p, phone_display: e.target.value }))}
                                className="w-full rounded-xl border border-black/10 bg-white/90 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-[#7A0022]/50 focus:ring-2 focus:ring-[#7A0022]/10"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.28em] text-zinc-400">
                                E.164
                            </label>
                            <input
                                type="text"
                                placeholder="60133552455"
                                value={newContact.phone_e164}
                                onChange={(e) => setNewContact((p) => ({ ...p, phone_e164: e.target.value }))}
                                className="w-full rounded-xl border border-black/10 bg-white/90 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-[#7A0022]/50 focus:ring-2 focus:ring-[#7A0022]/10"
                            />
                        </div>
                    </div>
                    <button
                        onClick={addContact}
                        disabled={adding || !newContact.name || !newContact.phone_display || !newContact.phone_e164}
                        className="mt-4 inline-flex items-center rounded-xl bg-[#7A0022] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#64001C] disabled:opacity-40 transition"
                    >
                        {adding ? "Adding…" : "+ Add Contact"}
                    </button>
                </div>
            </div>
        </main>
    );
}
