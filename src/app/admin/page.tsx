"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

export default function AdminPage() {
  const [rows, setRows] = useState<RsvpRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionFilter, setSessionFilter] = useState<SessionFilter>("All");
  const [guestOfFilter, setGuestOfFilter] = useState<GuestOfFilter>("All");
  const [sort, setSort] = useState<Sort>("newest");
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deletingIds, setDeletingIds] = useState<Record<string, boolean>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [savingField, setSavingField] = useState<Record<string, boolean>>({});
  const [savedField, setSavedField] = useState<Record<string, boolean>>({});

  async function load() {
    setLoading(true);
    setError("");

    let q = supabase
      .from("rsvps")
      .select("id, full_name, phone, guests, adults, kids, session, guest_of, message, created_at");

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

  function exportCSV() {
    const headers = ["Full Name", "Phone", "Guests", "Adults", "Kids", "Session", "Guest Of", "Submitted At"];
    const lines = rows.map((r) => [
      r.full_name ?? "", r.phone ?? "", String(r.guests ?? 0), String(r.adults ?? 0),
      String(r.kids ?? 0), r.session ?? "", r.guest_of ?? "",
      new Date(r.created_at).toLocaleString(),
    ]);
    const csv = [headers, ...lines].map((row) => row.map(csvEscape).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rsvps_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function exportPDF() {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 10;

    // ── Header band ──
    doc.setFillColor(122, 0, 34);
    doc.rect(0, 0, pageW, 26, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text("RSVP Guest List", margin, 11);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(255, 200, 215);
    const subtitle = [
      sessionFilter !== "All" ? sessionFilter : "All Sessions",
      guestOfFilter !== "All" ? `· ${guestOfFilter} Side` : "· Bride & Groom",
    ].join(" ");
    doc.text(subtitle, margin, 18);

    doc.setFontSize(7);
    doc.text(
      `Generated ${new Date().toLocaleString("en-MY", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}`,
      pageW - margin, 18, { align: "right" }
    );

    // ── Summary: 2 rows × 4 cols ──
    const summaryRows = [
      [
        { label: "Submissions", value: String(totals.submissions), accent: true },
        { label: "Total Guests", value: String(totals.totalGuests), accent: true },
        { label: "Adults", value: String(totals.totalAdults), accent: false },
        { label: "Kids", value: String(totals.totalKids), accent: false },
      ],
      [
        { label: "Session 1", value: String(totals.session1), accent: false },
        { label: "Session 2", value: String(totals.session2), accent: false },
        { label: "Session 3", value: String(totals.session3), accent: false },
        { label: "Bride / Groom", value: `${totals.bride} / ${totals.groom}`, accent: false },
      ],
    ];
    const blockW = (pageW - margin * 2) / 4;
    const blockH = 14;
    summaryRows.forEach((rowItems, ri) => {
      const rowY = 29 + ri * (blockH + 1);
      rowItems.forEach((item, ci) => {
        const bx = margin + ci * blockW;
        if (item.accent) {
          doc.setFillColor(122, 0, 34);
          doc.setTextColor(255, 255, 255);
        } else {
          doc.setFillColor(250, 245, 247);
          doc.setTextColor(50, 40, 45);
        }
        doc.roundedRect(bx, rowY, blockW - 1, blockH, 2, 2, "F");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.text(item.value, bx + blockW / 2 - 0.5, rowY + 7, { align: "center" });

        doc.setFont("helvetica", "normal");
        doc.setFontSize(6.5);
        if (item.accent) doc.setTextColor(255, 200, 215);
        else doc.setTextColor(140, 100, 115);
        doc.text(item.label.toUpperCase(), bx + blockW / 2 - 0.5, rowY + 11.5, { align: "center" });
      });
    });

    const tableStartY = 29 + 2 * (blockH + 1) + 4;

    // ── Table: 4 readable columns ──
    autoTable(doc, {
      startY: tableStartY,
      head: [["#", "Name & Phone", "Session · Side", "Guests"]],
      body: rows.map((r, i) => [
        String(i + 1),
        `${r.full_name ?? "—"}\n${r.phone ?? "No phone"}`,
        `${r.session ?? "—"} · ${r.guest_of ?? "—"}`,
        `Total: ${r.guests ?? 0}\nAdults: ${r.adults ?? 0}  Kids: ${r.kids ?? 0}`,
      ]),
      styles: {
        fontSize: 9.5,
        cellPadding: { top: 4, right: 5, bottom: 4, left: 5 },
        lineColor: [230, 218, 222],
        lineWidth: 0.2,
        textColor: [50, 40, 45],
        overflow: "linebreak",
        valign: "middle",
      },
      headStyles: {
        fillColor: [122, 0, 34],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 8.5,
        cellPadding: { top: 5, right: 5, bottom: 5, left: 5 },
      },
      alternateRowStyles: { fillColor: [253, 249, 247] },
      columnStyles: {
        0: { halign: "center", cellWidth: 15, fontStyle: "bold" },
        1: { cellWidth: 67 },
        2: { cellWidth: 56 },
        3: { cellWidth: 52, halign: "center" },
      },
      margin: { left: margin, right: margin },
    });

    // ── Footer on every page ──
    const pageCount = (doc.internal as unknown as { getNumberOfPages: () => number }).getNumberOfPages();
    for (let p = 1; p <= pageCount; p++) {
      doc.setPage(p);
      const ph = doc.internal.pageSize.getHeight();
      doc.setFillColor(245, 240, 242);
      doc.rect(0, ph - 9, pageW, 9, "F");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(150, 110, 120);
      doc.text("Zhafirin & Ayuni · RSVP Guest List", margin, ph - 3);
      doc.text(`Page ${p} of ${pageCount}`, pageW - margin, ph - 3, { align: "right" });
    }

    doc.save(`rsvps_${new Date().toISOString().slice(0, 10)}.pdf`);
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
    setDeletingIds((m) => { const copy = { ...m }; delete copy[id]; return copy; });
  }

  // Auto-save immediately on dropdown change, optimistic update
  async function updateField(id: string, field: "session" | "guest_of", value: Session | GuestOf) {
    const key = `${id}_${field}`;
    setSavingField((m) => ({ ...m, [key]: true }));

    // Optimistic update so badge refreshes instantly
    setRows((prev) => prev.map((r) => r.id === id ? { ...r, [field]: value } : r));

    const { error } = await supabase.from("rsvps").update({ [field]: value }).eq("id", id);

    if (error) {
      setError(`Failed to update: ${error.message}`);
      await load(); // restore on failure
    } else {
      setSavedField((m) => ({ ...m, [key]: true }));
      setTimeout(() => setSavedField((m) => { const c = { ...m }; delete c[key]; return c; }), 1500);
    }

    setSavingField((m) => { const copy = { ...m }; delete copy[key]; return copy; });
  }

  const sessionColor: Record<string, string> = {
    "Session 1": "bg-amber-50 text-amber-800 border-amber-200",
    "Session 2": "bg-sky-50 text-sky-800 border-sky-200",
    "Session 3": "bg-violet-50 text-violet-800 border-violet-200",
  };

  const guestOfColor: Record<string, string> = {
    Bride: "bg-rose-50 text-rose-700 border-rose-200",
    Groom: "bg-slate-50 text-slate-700 border-slate-200",
  };

  return (
    <main className="min-h-screen bg-[#FBF7F2] text-zinc-800">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(1200px_800px_at_10%_10%,rgba(122,0,34,0.08),transparent_60%),radial-gradient(900px_700px_at_90%_20%,rgba(0,0,0,0.05),transparent_55%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-[#FBF7F2]/55 to-white/80" />
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 sm:pt-14">

        {/* ── Header ── */}
        <div className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[#7A0022]/80">Admin</p>
            <h1 className="mt-1 font-serif text-3xl font-semibold text-zinc-900 sm:text-4xl">RSVP Dashboard</h1>
            <p className="mt-1 text-sm text-zinc-500">
              {loading ? "Loading…" : `${totals.submissions} submission${totals.submissions !== 1 ? "s" : ""} · ${totals.totalGuests} guests total`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/messages" className="inline-flex items-center gap-1.5 rounded-full bg-[#7A0022] px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#64001C] transition">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 16V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2h11l4 4-1-4h1a2 2 0 002-2z" /></svg>
              Message
            </Link>
            <Link href="/admin/sessions" className="inline-flex items-center gap-1.5 rounded-full bg-[#7A0022] px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#64001C] transition">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              Session
            </Link>
            <Link href="/admin/schedule" className="inline-flex items-center gap-1.5 rounded-full bg-[#7A0022] px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#64001C] transition">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              Schedule
            </Link>
            <button onClick={exportCSV} disabled={rows.length === 0} className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white/85 px-4 py-2.5 text-sm text-zinc-800 hover:bg-white disabled:opacity-40 transition">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              CSV
            </button>
            <button onClick={exportPDF} disabled={rows.length === 0} className="inline-flex items-center gap-1.5 rounded-full border border-[#7A0022]/20 bg-[#7A0022]/5 px-4 py-2.5 text-sm font-medium text-[#7A0022] hover:bg-[#7A0022]/10 disabled:opacity-40 transition">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /><path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6" /></svg>
              PDF
            </button>
            <button onClick={load} className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white/85 px-4 py-2.5 text-sm text-zinc-800 hover:bg-white transition">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              Refresh
            </button>
          </div>
        </div>

        {/* ── Stat Strip ── */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9">
          <StatCard label="Submissions" value={totals.submissions} accent />
          <StatCard label="Total guests" value={totals.totalGuests} accent />
          <StatCard label="Adults" value={totals.totalAdults} />
          <StatCard label="Kids" value={totals.totalKids} />
          <StatCard label="Session 1" value={totals.session1} dot="bg-amber-400" />
          <StatCard label="Session 2" value={totals.session2} dot="bg-sky-400" />
          <StatCard label="Session 3" value={totals.session3} dot="bg-violet-400" />
          <StatCard label="Bride side" value={totals.bride} dot="bg-rose-400" />
          <StatCard label="Groom side" value={totals.groom} dot="bg-slate-400" />
        </div>

        {/* ── Filters ── */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 mr-1">Filter</span>
          {(["All", "Session 1", "Session 2", "Session 3"] as SessionFilter[]).map((s) => (
            <button key={s} onClick={() => setSessionFilter(s)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${sessionFilter === s ? "border-[#7A0022] bg-[#7A0022] text-white" : "border-black/10 bg-white/70 text-zinc-600 hover:bg-white"}`}>
              {s === "All" ? "All Sessions" : s}
            </button>
          ))}
          <div className="h-4 w-px bg-black/10 mx-1" />
          {(["All", "Bride", "Groom"] as GuestOfFilter[]).map((g) => (
            <button key={g} onClick={() => setGuestOfFilter(g)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${guestOfFilter === g ? "border-[#7A0022] bg-[#7A0022] text-white" : "border-black/10 bg-white/70 text-zinc-600 hover:bg-white"}`}>
              {g === "All" ? "Bride + Groom" : g}
            </button>
          ))}
          <div className="ml-auto">
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)}
              className="rounded-full border border-black/10 bg-white/85 px-4 py-2 text-xs text-zinc-700 hover:bg-white">
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="name_az">Name (A–Z)</option>
            </select>
          </div>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
        )}

        {/* ── Cards ── */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-[24px] border border-black/5 bg-white/60" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[28px] border border-black/5 bg-white/60 py-20 text-center">
            <p className="text-sm font-medium text-zinc-400">No submissions found</p>
            <p className="mt-1 text-xs text-zinc-300">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((r, idx) => {
              const isExpanded = expandedId === r.id;
              const initials = (r.full_name ?? "?")
                .split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
              const sessionKey = `${r.id}_session`;
              const guestOfKey = `${r.id}_guest_of`;

              return (
                <div
                  key={r.id}
                  className="group relative flex flex-col overflow-hidden rounded-[24px] border border-white/60 bg-white/75 shadow-[0_8px_30px_rgba(0,0,0,0.07)] backdrop-blur-sm transition-all duration-300 hover:shadow-[0_12px_40px_rgba(122,0,34,0.10)] hover:-translate-y-0.5"
                  style={{ animationDelay: `${idx * 30}ms` }}
                >
                  {/* Top accent bar */}
                  <div className={`h-1 w-full ${r.session === "Session 1" ? "bg-gradient-to-r from-amber-300 to-amber-400" : r.session === "Session 2" ? "bg-gradient-to-r from-sky-300 to-sky-400" : r.session === "Session 3" ? "bg-gradient-to-r from-violet-300 to-violet-400" : "bg-gradient-to-r from-zinc-200 to-zinc-300"}`} />

                  {/* Clickable card body */}
                  <button onClick={() => setExpandedId(isExpanded ? null : r.id)} className="w-full text-left">
                    <div className="flex flex-col gap-4 p-5">
                      {/* Avatar + name row */}
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#7A0022]/10 text-sm font-semibold text-[#7A0022]">
                          {initials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-zinc-900">{r.full_name || "—"}</p>
                          <p className="mt-0.5 text-xs text-zinc-400">{r.phone || "No phone"}</p>
                        </div>
                        <div className="flex flex-col gap-1.5 items-end shrink-0">
                          {r.session && (
                            <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${sessionColor[r.session] ?? "bg-zinc-50 text-zinc-600 border-zinc-200"}`}>
                              {r.session}
                            </span>
                          )}
                          {r.guest_of && (
                            <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${guestOfColor[r.guest_of] ?? "bg-zinc-50 text-zinc-600 border-zinc-200"}`}>
                              {r.guest_of}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Guest count pills */}
                      <div className="flex gap-2">
                        <GuestPill icon="👥" label="Total" value={r.guests ?? 0} />
                        <GuestPill icon="🧑" label="Adults" value={r.adults ?? 0} />
                        <GuestPill icon="🧒" label="Kids" value={r.kids ?? 0} />
                      </div>

                      {/* Message preview */}
                      {r.message && r.message.trim().length > 0 && (
                        <div className="flex items-center gap-2">
                          <svg className="h-3.5 w-3.5 shrink-0 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 16V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2h11l4 4-1-4h1a2 2 0 002-2z" />
                          </svg>
                          <p className="truncate text-xs italic text-zinc-400">&quot;{r.message.trim()}&quot;</p>
                        </div>
                      )}

                      {/* Date + chevron */}
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
                        <svg className={`h-3.5 w-3.5 text-zinc-300 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </button>

                  {/* ── Expanded panel ── */}
                  {isExpanded && (
                    <div className="border-t border-black/5 bg-zinc-50/70 px-5 py-4 flex flex-col gap-3">

                      {/* Session dropdown */}
                      <div>
                        <div className="mb-1 flex items-center gap-2">
                          <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Session</label>
                          {savingField[sessionKey] && <span className="text-[10px] text-zinc-400">Saving…</span>}
                          {savedField[sessionKey] && <span className="text-[10px] text-emerald-600">✓ Saved</span>}
                        </div>
                        <select
                          value={r.session ?? ""}
                          disabled={savingField[sessionKey]}
                          onChange={(e) => updateField(r.id, "session", e.target.value as Session)}
                          className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-zinc-800 outline-none focus:border-zinc-300 disabled:opacity-60 transition"
                        >
                          <option value="Session 1">Session 1</option>
                          <option value="Session 2">Session 2</option>
                          <option value="Session 3">Session 3</option>
                        </select>
                      </div>

                      {/* Guest of dropdown */}
                      <div>
                        <div className="mb-1 flex items-center gap-2">
                          <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Guest of</label>
                          {savingField[guestOfKey] && <span className="text-[10px] text-zinc-400">Saving…</span>}
                          {savedField[guestOfKey] && <span className="text-[10px] text-emerald-600">✓ Saved</span>}
                        </div>
                        <select
                          value={r.guest_of ?? ""}
                          disabled={savingField[guestOfKey]}
                          onChange={(e) => updateField(r.id, "guest_of", e.target.value as GuestOf)}
                          className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-zinc-800 outline-none focus:border-zinc-300 disabled:opacity-60 transition"
                        >
                          <option value="Bride">Bride</option>
                          <option value="Groom">Groom</option>
                        </select>
                      </div>

                      {/* Delete + ID row */}
                      <div className="flex items-center justify-between pt-1">
                        <p className="text-[10px] font-mono text-zinc-300 select-none">#{r.id.slice(0, 8)}</p>
                        <button
                          onClick={() => setDeleteId(r.id)}
                          disabled={!!deletingIds[r.id]}
                          className="inline-flex items-center gap-1 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-40 transition"
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

function GuestPill({ icon, label, value }: { icon: string; label: string; value: number }) {
  return (
    <div className="flex flex-1 items-center gap-1.5 rounded-xl border border-black/5 bg-zinc-50 px-2.5 py-2">
      <span className="text-base leading-none">{icon}</span>
      <div>
        <p className="text-[10px] text-zinc-400">{label}</p>
        <p className="text-sm font-semibold text-zinc-800">{value}</p>
      </div>
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

function ConfirmModal({ title, description, confirmText, cancelText, onConfirm, onCancel }: {
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
            <button onClick={onCancel} className="flex-1 rounded-full border border-black/10 bg-white px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50">{cancelText}</button>
            <button onClick={onConfirm} className="flex-1 rounded-full bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700">{confirmText}</button>
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
