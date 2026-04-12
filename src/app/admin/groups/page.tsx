"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import jsPDF from "jspdf";

type Group = { id: string; name: string; color: string; created_at: string };
type Session = "Session 1" | "Session 2" | "Session 3";
type GuestOf = "Bride" | "Groom";
type Guest = {
    id: string;
    full_name: string | null;
    session: Session | null;
    guest_of: GuestOf | null;
    guests: number | null;
    adults: number | null;
    kids: number | null;
    group_id: string | null;
};

const PRESET_COLORS = [
    "#7A0022", "#1c1917", "#0f766e", "#1d4ed8",
    "#7c3aed", "#b45309", "#be123c", "#166534",
];

const SESSION_DOT: Record<string, string> = {
    "Session 1": "bg-amber-400",
    "Session 2": "bg-sky-400",
    "Session 3": "bg-violet-400",
};

function StatPill({ label, value }: { label: string; value: number | string }) {
    return (
        <div className="flex flex-col items-center rounded-xl bg-black/3 px-3 py-1.5">
            <span className="text-xs font-bold text-zinc-700">{value}</span>
            <span className="text-[10px] text-zinc-400">{label}</span>
        </div>
    );
}

function makeGroupStats(guests: Guest[]) {
    return (id: string) => {
        const m = guests.filter(g => g.group_id === id);
        return {
            submissions: m.length,
            pax:    m.reduce((s, g) => s + (Number(g.guests) || 0), 0),
            adults: m.reduce((s, g) => s + (Number(g.adults) || 0), 0),
            kids:   m.reduce((s, g) => s + (Number(g.kids)   || 0), 0),
            s1: m.filter(g => g.session === "Session 1").length,
            s2: m.filter(g => g.session === "Session 2").length,
            s3: m.filter(g => g.session === "Session 3").length,
            bride: m.filter(g => g.guest_of === "Bride").length,
            groom: m.filter(g => g.guest_of === "Groom").length,
        };
    };
}


export default function GroupsPage() {
    const [groups, setGroups] = useState<Group[]>([]);
    const [guests, setGuests] = useState<Guest[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedGroup, setSelectedGroup] = useState<string | "all" | "none">("all");
    const [search, setSearch] = useState("");

    const [newName, setNewName] = useState("");
    const [newColor, setNewColor] = useState(PRESET_COLORS[0]);
    const [creating, setCreating] = useState(false);
    const [showForm, setShowForm] = useState(false);

    const [assigning, setAssigning] = useState<Record<string, boolean>>({});
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [exportingPdf, setExportingPdf] = useState(false);
    const [exportingPdfId, setExportingPdfId] = useState<string | null>(null);

    const loadAll = useCallback(async () => {
        setLoading(true);
        const [{ data: grpData }, { data: rsvpData }, { data: assignData }] = await Promise.all([
            supabase.from("groups").select("*").order("created_at"),
            supabase.from("rsvps").select("id, full_name, session, guest_of, guests, adults, kids").order("full_name"),
            supabase.from("guest_group_assignments").select("rsvp_id, group_id"),
        ]);

        const assignMap: Record<string, string> = {};
        (assignData ?? []).forEach(a => { assignMap[a.rsvp_id] = a.group_id; });

        setGroups(grpData ?? []);
        setGuests((rsvpData ?? []).map(r => ({ ...r, group_id: assignMap[r.id] ?? null })));
        setLoading(false);
    }, []);

    useEffect(() => { loadAll(); }, [loadAll]);

    async function createGroup() {
        if (!newName.trim()) return;
        setCreating(true);
        const { data, error } = await supabase.from("groups").insert({ name: newName.trim(), color: newColor }).select().single();
        setCreating(false);
        if (!error && data) { setGroups(g => [...g, data]); setNewName(""); setShowForm(false); }
    }

    async function deleteGroup(id: string) {
        await supabase.from("groups").delete().eq("id", id);
        setGroups(g => g.filter(x => x.id !== id));
        setGuests(g => g.map(x => x.group_id === id ? { ...x, group_id: null } : x));
        if (selectedGroup === id) setSelectedGroup("all");
    }

    async function buildGroupSection(
        pdf: jsPDF,
        autoTable: (doc: jsPDF, opts: object) => void,
        grp: Group,
        y: number,
        margin: number,
        accent: [number, number, number],
    ): Promise<number> {
        const pageW = pdf.internal.pageSize.getWidth();
        const contentW = pageW - margin * 2;
        const s = groupStats(grp.id);
        const members = guests.filter(g => g.group_id === grp.id);

        // Group name bar
        pdf.setFillColor(...accent);
        pdf.roundedRect(margin, y, contentW, 16, 2, 2, "F");
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(15);
        pdf.setFont("helvetica", "bold");
        pdf.text(grp.name, margin + 5, y + 11);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
        pdf.text(`${s.submissions} submissions`, pageW - margin - 5, y + 11, { align: "right" });
        y += 20;

        // Stats — single line
        pdf.setFontSize(11);
        pdf.setTextColor(50, 50, 50);
        pdf.setFont("helvetica", "bold");
        pdf.text(`Pax:${s.pax}  Adults:${s.adults}  Kids:${s.kids}  S1:${s.s1}  S2:${s.s2}  S3:${s.s3}  Bride:${s.bride}  Groom:${s.groom}`, margin + 2, y + 5);
        pdf.setFont("helvetica", "normal");
        y += 12;

        if (members.length === 0) {
            pdf.setTextColor(160, 160, 160);
            pdf.setFontSize(11);
            pdf.text("No guests assigned", margin + 2, y + 5);
            y += 12;
        } else {
            // Columns sum exactly to contentW (178mm) so no extra right space
            autoTable(pdf, {
                startY: y,
                margin: { left: margin, right: margin },
                tableWidth: contentW,
                head: [["#", "Name", "Session", "Guest of", "Pax", "Adults", "Kids"]],
                body: members.map((g, i) => [
                    i + 1,
                    g.full_name ?? "—",
                    g.session?.replace("Session ", "S") ?? "—",
                    g.guest_of ?? "—",
                    g.guests ?? 0,
                    g.adults ?? 0,
                    g.kids ?? 0,
                ]),
                styles: { fontSize: 13, cellPadding: 3 },
                headStyles: { fillColor: [240, 240, 238], textColor: [40, 40, 40], fontStyle: "bold", fontSize: 11, cellPadding: 3 },
                columnStyles: {
                    0: { cellWidth: 12 },
                    1: { cellWidth: 56 },
                    2: { cellWidth: 26 },
                    3: { cellWidth: 28 },
                    4: { cellWidth: 16 },
                    5: { cellWidth: 22 },
                    6: { cellWidth: 18 },
                },
                alternateRowStyles: { fillColor: [250, 250, 249] },
                tableLineColor: [210, 210, 210],
                tableLineWidth: 0.3,
            });
            y = (pdf as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
        }
        return y;
    }

    async function exportAllPdf() {
        if (groups.length === 0) return;
        setExportingPdf(true);
        try {
            const { default: autoTable } = await import("jspdf-autotable");
            const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
            const pageW = pdf.internal.pageSize.getWidth();
            const pageH = pdf.internal.pageSize.getHeight();
            const margin = 16;
            const accent = [122, 0, 34] as [number, number, number];
            const dateStr = new Date().toLocaleDateString("en-MY", { day: "numeric", month: "long", year: "numeric" });

            // Page header
            pdf.setFillColor(...accent);
            pdf.rect(0, 0, pageW, 26, "F");
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(15);
            pdf.setFont("helvetica", "bold");
            pdf.text("Zhafirin & Ayuni — Guest Groups", margin, 17);
            pdf.setFontSize(10);
            pdf.setFont("helvetica", "normal");
            pdf.text(dateStr, pageW - margin, 17, { align: "right" });

            let y = 32;

            for (let gi = 0; gi < groups.length; gi++) {
                if (gi > 0 && y > pageH - 50) { pdf.addPage(); y = 16; }
                y = await buildGroupSection(pdf, autoTable, groups[gi], y, margin, accent);
            }

            const totalPages = (pdf as jsPDF & { internal: { getNumberOfPages: () => number } }).internal.getNumberOfPages();
            for (let p = 1; p <= totalPages; p++) {
                pdf.setPage(p);
                pdf.setTextColor(180, 180, 180);
                pdf.setFontSize(8);
                pdf.text(`Page ${p} of ${totalPages}`, pageW / 2, pageH - 6, { align: "center" });
            }

            pdf.save(`groups_${new Date().toISOString().slice(0, 10)}.pdf`);
        } catch (err) {
            console.error("PDF export failed:", err);
        } finally {
            setExportingPdf(false);
        }
    }

    async function exportGroupPdf(grp: Group) {
        setExportingPdfId(grp.id);
        try {
            const { default: autoTable } = await import("jspdf-autotable");
            const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
            const pageW = pdf.internal.pageSize.getWidth();
            const pageH = pdf.internal.pageSize.getHeight();
            const margin = 16;
            const accent = [122, 0, 34] as [number, number, number];
            const dateStr = new Date().toLocaleDateString("en-MY", { day: "numeric", month: "long", year: "numeric" });

            pdf.setFillColor(...accent);
            pdf.rect(0, 0, pageW, 26, "F");
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(15);
            pdf.setFont("helvetica", "bold");
            pdf.text(grp.name, margin, 17);
            pdf.setFontSize(10);
            pdf.setFont("helvetica", "normal");
            pdf.text(dateStr, pageW - margin, 17, { align: "right" });

            await buildGroupSection(pdf, autoTable, grp, 32, margin, accent);

            const totalPages = (pdf as jsPDF & { internal: { getNumberOfPages: () => number } }).internal.getNumberOfPages();
            for (let p = 1; p <= totalPages; p++) {
                pdf.setPage(p);
                pdf.setTextColor(180, 180, 180);
                pdf.setFontSize(8);
                pdf.text(`Page ${p} of ${totalPages}`, pageW / 2, pageH - 6, { align: "center" });
            }

            pdf.save(`group_${grp.name.replace(/\s+/g, "_").toLowerCase()}_${new Date().toISOString().slice(0, 10)}.pdf`);
        } catch (err) {
            console.error("Group PDF export failed:", err);
        } finally {
            setExportingPdfId(null);
        }
    }

    async function assignGroup(guestId: string, groupId: string | null) {
        setAssigning(a => ({ ...a, [guestId]: true }));
        if (groupId === null) {
            await supabase.from("guest_group_assignments").delete().eq("rsvp_id", guestId);
        } else {
            await supabase.from("guest_group_assignments").upsert({ rsvp_id: guestId, group_id: groupId });
        }
        setGuests(g => g.map(x => x.id === guestId ? { ...x, group_id: groupId } : x));
        setAssigning(a => ({ ...a, [guestId]: false }));
    }

    const groupStats = makeGroupStats(guests);

    const allStats = {
        submissions: guests.length,
        pax:    guests.reduce((s, g) => s + (Number(g.guests) || 0), 0),
        adults: guests.reduce((s, g) => s + (Number(g.adults) || 0), 0),
        kids:   guests.reduce((s, g) => s + (Number(g.kids)   || 0), 0),
    };

    const filteredGuests = guests.filter(g => {
        const matchSearch = !search || (g.full_name ?? "").toLowerCase().includes(search.toLowerCase());
        const matchGroup =
            selectedGroup === "all"  ? true :
            selectedGroup === "none" ? g.group_id === null :
            g.group_id === selectedGroup;
        return matchSearch && matchGroup;
    });

    return (
        <>
        <main className="min-h-screen bg-[#FBF7F2] text-zinc-800">
            <div className="pointer-events-none fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-[radial-gradient(1200px_800px_at_10%_10%,rgba(122,0,34,0.08),transparent_60%)]" />
            </div>

            <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">

                {/* Header */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[#7A0022]/80">Admin</p>
                        <h1 className="mt-1 font-serif text-3xl font-semibold text-zinc-900 sm:text-4xl">Guest Groups</h1>
                        <p className="mt-1 text-sm text-zinc-500">
                            {loading ? "Loading…" : `${guests.length} submissions · ${allStats.pax} pax · ${groups.length} group${groups.length !== 1 ? "s" : ""}`}
                        </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                        <Link href="/admin" className="inline-flex items-center gap-1.5 rounded-full bg-[#7A0022] px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#64001C] transition">
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            Dashboard
                        </Link>
                        <button
                            onClick={exportAllPdf}
                            disabled={exportingPdf || groups.length === 0}
                            className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white/85 px-4 py-2.5 text-sm text-zinc-700 hover:bg-white transition disabled:opacity-40">
                            {exportingPdf ? "Generating…" : "PDF"}
                        </button>
                        <button onClick={() => setShowForm(v => !v)} className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white/85 px-4 py-2.5 text-sm text-zinc-700 hover:bg-white transition">
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d={showForm ? "M6 18L18 6M6 6l12 12" : "M12 4v16m8-8H4"} /></svg>
                            {showForm ? "Cancel" : "New Group"}
                        </button>
                    </div>
                </div>

                {/* New group form */}
                {showForm && (
                    <div className="mb-6 rounded-3xl border border-black/10 bg-white/80 p-5 shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
                        <p className="mb-4 text-sm font-semibold text-zinc-800">Create Group</p>
                        <div className="flex flex-wrap items-end gap-3">
                            <div className="flex-1 min-w-[180px]">
                                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Name</label>
                                <input type="text" value={newName} onChange={e => setNewName(e.target.value)}
                                    onKeyDown={e => e.key === "Enter" && createGroup()}
                                    placeholder="e.g. Table 1, Family, VIP…"
                                    className="w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#7A0022]/40 focus:ring-2 focus:ring-[#7A0022]/10" />
                            </div>
                            <div>
                                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Colour</label>
                                <div className="flex gap-1.5">
                                    {PRESET_COLORS.map(c => (
                                        <button key={c} onClick={() => setNewColor(c)} className="h-7 w-7 rounded-full border-2 transition"
                                            style={{ background: c, borderColor: newColor === c ? "#000" : "transparent", outline: newColor === c ? "2px solid #fff" : "none", outlineOffset: "-3px" }} />
                                    ))}
                                </div>
                            </div>
                            <button onClick={createGroup} disabled={!newName.trim() || creating}
                                className="rounded-full bg-[#7A0022] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#64001C] disabled:opacity-50 transition">
                                {creating ? "Creating…" : "Create"}
                            </button>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr]">

                    {/* ── Left: Groups panel ── */}
                    <div className="space-y-2">
                        <p className="px-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Filter by group</p>

                        {/* All */}
                        <button onClick={() => setSelectedGroup("all")}
                            className={["w-full text-left rounded-2xl border px-4 py-3 transition",
                                selectedGroup === "all" ? "border-[#7A0022]/30 bg-[#7A0022]/8" : "border-black/8 bg-white/75 hover:bg-white"
                            ].join(" ")}>
                            <div className="flex items-center justify-between">
                                <span className={`text-sm font-semibold ${selectedGroup === "all" ? "text-[#7A0022]" : "text-zinc-800"}`}>All guests</span>
                                <span className="text-xs text-zinc-400">{allStats.submissions} submissions</span>
                            </div>
                            <div className="mt-2 flex gap-2">
                                <StatPill label="Pax" value={allStats.pax} />
                                <StatPill label="Adults" value={allStats.adults} />
                                <StatPill label="Kids" value={allStats.kids} />
                            </div>
                        </button>

                        {/* Unassigned */}
                        <button onClick={() => setSelectedGroup("none")}
                            className={["w-full flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-medium transition",
                                selectedGroup === "none" ? "border-[#7A0022]/30 bg-[#7A0022]/8 text-[#7A0022]" : "border-black/8 bg-white/75 text-zinc-700 hover:bg-white"
                            ].join(" ")}>
                            <span>Unassigned</span>
                            <span className="text-xs text-zinc-400">{guests.filter(g => !g.group_id).length} submissions</span>
                        </button>

                        {/* Group list */}
                        {groups.length > 0 && (
                            <div className="pt-1 space-y-2">
                                <p className="px-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Groups</p>
                                {groups.map(grp => {
                                    const s = groupStats(grp.id);
                                    const isConfirming = confirmDeleteId === grp.id;
                                    return (
                                        <div key={grp.id}
                                            className={["group rounded-2xl border transition overflow-hidden cursor-pointer",
                                                selectedGroup === grp.id ? "border-[#7A0022]/30 bg-[#7A0022]/8" : "border-black/8 bg-white/75 hover:bg-white"
                                            ].join(" ")}
                                            onClick={() => { if (!isConfirming) setSelectedGroup(grp.id); }}>

                                            {/* Name row */}
                                            <div className="flex items-center gap-2 px-4 pt-3 pb-2">
                                                <div className="h-3 w-3 shrink-0 rounded-full" style={{ background: grp.color }} />
                                                <span className={`flex-1 text-sm font-semibold truncate ${selectedGroup === grp.id ? "text-[#7A0022]" : "text-zinc-800"}`}>
                                                    {grp.name}
                                                </span>
                                                <span className="text-[11px] text-zinc-400">{s.submissions} submissions</span>
                                                {!isConfirming && (
                                                    <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                                                        {/* PDF */}
                                                        <button onClick={() => exportGroupPdf(grp)}
                                                            disabled={exportingPdfId === grp.id}
                                                            title="Export as PDF"
                                                            className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-zinc-400 hover:text-[#7A0022] hover:bg-[#7A0022]/8 transition disabled:opacity-40">
                                                            {exportingPdfId === grp.id ? "…" : "PDF"}
                                                        </button>
                                                        {/* Delete */}
                                                        <button onClick={() => setConfirmDeleteId(grp.id)}
                                                            title="Delete group"
                                                            className="rounded-full p-1 text-zinc-300 hover:text-red-500 transition">
                                                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Stats grid */}
                                            <div className="px-4 pb-3 flex flex-wrap gap-1.5">
                                                {([
                                                    { label: "Pax", value: s.pax },
                                                    { label: "Adults", value: s.adults },
                                                    { label: "Kids", value: s.kids },
                                                    { label: "S1", value: s.s1 },
                                                    { label: "S2", value: s.s2 },
                                                    { label: "S3", value: s.s3 },
                                                    { label: "Bride", value: s.bride },
                                                    { label: "Groom", value: s.groom },
                                                ] as { label: string; value: number }[]).filter(x => x.value > 0).map(x => (
                                                    <StatPill key={x.label} label={x.label} value={x.value} />
                                                ))}
                                            </div>

                                            {/* Delete confirmation */}
                                            {isConfirming && (
                                                <div className="flex flex-wrap items-center gap-2 border-t border-red-100 bg-red-50 px-4 py-2.5">
                                                    <svg className="h-3.5 w-3.5 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                                                    </svg>
                                                    <p className="flex-1 text-xs text-red-700 min-w-0">
                                                        Delete <strong>{grp.name}</strong>? Guests will be unassigned.
                                                    </p>
                                                    <button onClick={e => { e.stopPropagation(); setConfirmDeleteId(null); }}
                                                        className="rounded-full border border-black/10 bg-white px-2.5 py-1 text-xs text-zinc-600 hover:bg-zinc-50 transition">
                                                        Cancel
                                                    </button>
                                                    <button onClick={e => { e.stopPropagation(); setConfirmDeleteId(null); deleteGroup(grp.id); }}
                                                        className="rounded-full bg-red-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-red-700 transition">
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {!loading && groups.length === 0 && (
                            <p className="px-1 pt-2 text-xs text-zinc-400">No groups yet. Click &quot;New Group&quot; to create one.</p>
                        )}
                    </div>

                    {/* ── Right: Guest list ── */}
                    <div>
                        {/* Search */}
                        <div className="mb-4 relative">
                            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                                placeholder="Search guests…"
                                className="w-full rounded-2xl border border-black/10 bg-white/85 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#7A0022]/30 focus:ring-2 focus:ring-[#7A0022]/10" />
                        </div>

                        {loading ? (
                            <div className="space-y-2">
                                {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-20 animate-pulse rounded-2xl bg-zinc-100" />)}
                            </div>
                        ) : filteredGuests.length === 0 ? (
                            <div className="rounded-2xl border border-black/8 bg-white/70 p-8 text-center text-sm text-zinc-400">
                                No guests found.
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {filteredGuests.map(guest => {
                                    const assignedGroup = groups.find(g => g.id === guest.group_id);
                                    return (
                                        <div key={guest.id} className="rounded-2xl border border-black/8 bg-white/75 px-4 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">

                                            {/* Top row: name + group badge */}
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="text-sm font-semibold text-zinc-900 leading-snug">
                                                    {guest.full_name ?? "—"}
                                                </p>
                                                {assignedGroup && (
                                                    <span className="shrink-0 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
                                                        style={{ background: assignedGroup.color }}>
                                                        {assignedGroup.name}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Middle row: meta info */}
                                            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                                {guest.session && (
                                                    <span className="flex items-center gap-1 text-[11px] text-zinc-400">
                                                        <span className={`h-1.5 w-1.5 rounded-full ${SESSION_DOT[guest.session] ?? "bg-zinc-300"}`} />
                                                        {guest.session}
                                                    </span>
                                                )}
                                                {guest.guest_of && <span className="text-[11px] text-zinc-400">{guest.guest_of} side</span>}
                                                <span className="text-[11px] text-zinc-400">{guest.guests ?? 0} pax</span>
                                                {(guest.adults ?? 0) > 0 && <span className="text-[11px] text-zinc-400">{guest.adults} adults</span>}
                                                {(guest.kids ?? 0) > 0 && <span className="text-[11px] text-zinc-400">{guest.kids} kids</span>}
                                            </div>

                                            {/* Bottom row: assign dropdown */}
                                            <div className="mt-2">
                                                <select
                                                    value={guest.group_id ?? ""}
                                                    disabled={assigning[guest.id] || groups.length === 0}
                                                    onChange={e => assignGroup(guest.id, e.target.value || null)}
                                                    className="w-full rounded-xl border border-black/10 bg-zinc-50 px-2.5 py-1.5 text-xs text-zinc-700 outline-none focus:border-[#7A0022]/30 disabled:opacity-50 cursor-pointer">
                                                    <option value="">— No group —</option>
                                                    {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
        </>
    );
}
