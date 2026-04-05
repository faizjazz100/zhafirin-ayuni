“use client”;

import { useEffect, useMemo, useState } from “react”;
import Link from “next/link”;
import { supabase } from “@/lib/supabase”;

type Session = “Session 1” | “Session 2” | “Session 3”;
type GuestOf = “Bride” | “Groom”;
type SessionFilter = “All” | Session;
type GuestOfFilter = “All” | GuestOf;
type Sort = “newest” | “oldest” | “name_az”;

export const dynamic = “force-dynamic”;

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
const [sessionFilter, setSessionFilter] = useState<SessionFilter>(“All”);
const [guestOfFilter, setGuestOfFilter] = useState<GuestOfFilter>(“All”);
const [sort, setSort] = useState<Sort>(“newest”);
const [error, setError] = useState(””);
const [deleteId, setDeleteId] = useState<string | null>(null);
const [deletingIds, setDeletingIds] = useState<Record<string, boolean>>({});
const [expandedId, setExpandedId] = useState<string | null>(null);

async function load() {
setLoading(true);
setError(””);

```
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
```

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
const session1 = rows.filter((r) => r.session === “Session 1”).reduce((sum, r) => sum + (Number(r.guests) || 0), 0);
const session2 = rows.filter((r) => r.session === “Session 2”).reduce((sum, r) => sum + (Number(r.guests) || 0), 0);
const session3 = rows.filter((r) => r.session === “Session 3”).reduce((sum, r) => sum + (Number(r.guests) || 0), 0);
const bride = rows.filter((r) => r.guest_of === “Bride”).reduce((sum, r) => sum + (Number(r.guests) || 0), 0);
const groom = rows.filter((r) => r.guest_of === “Groom”).reduce((sum, r) => sum + (Number(r.guests) || 0), 0);
return { submissions, totalGuests, totalAdults, totalKids, session1, session2, session3, bride, groom };
}, [rows]);

function exportCSV() {
const headers = [“Full Name”, “Phone”, “Guests”, “Adults”, “Kids”, “Session”, “Guest Of”, “Submitted At”];
const lines = rows.map((r) => [
r.full_name ?? “”,
r.phone ?? “”,
String(r.guests ?? 0),
String(r.adults ?? 0),
String(r.kids ?? 0),
r.session ?? “”,
r.guest_of ?? “”,
new Date(r.created_at).toLocaleString(“en-MY”),
].map(csvEscape).join(”,”));
const blob = new Blob([headers.join(”,”) + “\n” + lines.join(”\n”)], { type: “text/csv” });
const url = URL.createObjectURL(blob);
const a = document.createElement(“a”);
a.href = url;
a.download = `rsvp-export-${new Date().toISOString().slice(0, 10)}.csv`;
a.click();
URL.revokeObjectURL(url);
}

function exportPDF() {
const printWindow = window.open(””, “_blank”);
if (!printWindow) return;

```
const generatedAt = new Date().toLocaleString("en-MY", {
  day: "numeric", month: "long", year: "numeric",
  hour: "2-digit", minute: "2-digit",
});

const sessionBadge = (session: string | null) => {
  const colors: Record<string, string> = {
    "Session 1": "#7A0022",
    "Session 2": "#b45309",
    "Session 3": "#1d4ed8",
  };
  const bg = session ? (colors[session] ?? "#71717a") : "#71717a";
  return `<span style="background:${bg};color:#fff;padding:2px 8px;border-radius:999px;font-size:10px;font-weight:600;letter-spacing:0.04em;">${session ?? "—"}</span>`;
};

const guestOfBadge = (go: string | null) => {
  const bg = go === "Bride" ? "#be185d" : go === "Groom" ? "#1d4ed8" : "#71717a";
  return `<span style="background:${bg}22;color:${bg};border:1px solid ${bg}44;padding:2px 8px;border-radius:999px;font-size:10px;font-weight:600;">${go ?? "—"}</span>`;
};

const tableRows = rows.map((r, i) => `
  <tr style="background:${i % 2 === 0 ? "#fff" : "#faf8f5"};">
    <td style="padding:9px 12px;border-bottom:1px solid #f0ece7;color:#71717a;font-size:11px;">${i + 1}</td>
    <td style="padding:9px 12px;border-bottom:1px solid #f0ece7;font-weight:600;color:#1c1917;">${r.full_name ?? "—"}</td>
    <td style="padding:9px 12px;border-bottom:1px solid #f0ece7;color:#57534e;font-size:12px;">${r.phone ?? "—"}</td>
    <td style="padding:9px 12px;border-bottom:1px solid #f0ece7;text-align:center;font-weight:700;color:#1c1917;">${r.guests ?? 0}</td>
    <td style="padding:9px 12px;border-bottom:1px solid #f0ece7;text-align:center;color:#57534e;">${r.adults ?? 0}</td>
    <td style="padding:9px 12px;border-bottom:1px solid #f0ece7;text-align:center;color:#57534e;">${r.kids ?? 0}</td>
    <td style="padding:9px 12px;border-bottom:1px solid #f0ece7;">${sessionBadge(r.session)}</td>
    <td style="padding:9px 12px;border-bottom:1px solid #f0ece7;">${guestOfBadge(r.guest_of)}</td>
    <td style="padding:9px 12px;border-bottom:1px solid #f0ece7;color:#a8a29e;font-size:11px;white-space:nowrap;">
      ${new Date(r.created_at).toLocaleString("en-MY", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
    </td>
  </tr>
  ${r.message ? `<tr style="background:${i % 2 === 0 ? "#fff" : "#faf8f5"};">
    <td></td>
    <td colspan="8" style="padding:0 12px 10px 12px;color:#78716c;font-size:11px;font-style:italic;border-bottom:1px solid #f0ece7;">
      💬 "${r.message}"
    </td>
  </tr>` : ""}
`).join("");

const html = `<!DOCTYPE html>
```

<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>RSVP Guest List — Zhafirin & Ayuni</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=Inter:wght@400;500;600;700&display=swap');

```
* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: 'Inter', -apple-system, sans-serif;
  background: #fff;
  color: #1c1917;
  font-size: 13px;
  line-height: 1.5;
}

/* ── Cover Header ── */
.cover {
  background: linear-gradient(135deg, #7A0022 0%, #4a0015 100%);
  color: #fff;
  padding: 40px 48px 36px;
  position: relative;
  overflow: hidden;
}
.cover::before {
  content: '';
  position: absolute;
  inset: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
.cover-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.6);
  margin-bottom: 8px;
}
.cover-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 34px;
  font-weight: 600;
  line-height: 1.15;
  margin-bottom: 4px;
}
.cover-sub {
  font-size: 13px;
  color: rgba(255,255,255,0.7);
  margin-bottom: 24px;
}
.cover-meta {
  font-size: 11px;
  color: rgba(255,255,255,0.55);
}

/* ── Stats Row ── */
.stats-row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0;
  background: #faf8f5;
  border-bottom: 2px solid #f0ece7;
}
.stat-cell {
  padding: 18px 20px;
  border-right: 1px solid #f0ece7;
  text-align: center;
}
.stat-cell:last-child { border-right: none; }
.stat-label {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #a8a29e;
  margin-bottom: 4px;
}
.stat-value {
  font-size: 26px;
  font-weight: 700;
  color: #7A0022;
  line-height: 1;
}
.stat-value.dark { color: #1c1917; }

/* ── Session Summary ── */
.session-bar {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0;
  background: #fff;
  border-bottom: 1px solid #f0ece7;
  padding: 0;
}
.session-cell {
  padding: 12px 20px;
  border-right: 1px solid #f0ece7;
  display: flex;
  align-items: center;
  gap: 10px;
}
.session-cell:last-child { border-right: none; }
.session-dot {
  width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0;
}
.session-cell-label { font-size: 11px; color: #78716c; }
.session-cell-val { font-size: 15px; font-weight: 700; color: #1c1917; margin-left: auto; }

/* ── Table ── */
.table-wrap {
  padding: 0;
}
table {
  width: 100%;
  border-collapse: collapse;
}
thead tr {
  background: #f5f1ec;
}
th {
  padding: 10px 12px;
  text-align: left;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: #78716c;
  border-bottom: 2px solid #e8e1d9;
  white-space: nowrap;
}
th.center { text-align: center; }

/* ── Footer ── */
.footer {
  background: #faf8f5;
  border-top: 1px solid #f0ece7;
  padding: 16px 48px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 10px;
  color: #a8a29e;
}

@media print {
  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  @page { margin: 0; size: A4 landscape; }
  .no-print { display: none !important; }
  tr { page-break-inside: avoid; }
}
```

  </style>
</head>
<body>

  <!-- Print button (hidden when printing) -->

  <div class="no-print" style="background:#f5f1ec;padding:12px 24px;display:flex;align-items:center;gap:12px;border-bottom:1px solid #e8e1d9;">
    <button onclick="window.print()" style="background:#7A0022;color:#fff;border:none;border-radius:999px;padding:8px 20px;font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:6px;">
      🖨️ Print / Save as PDF
    </button>
    <span style="font-size:12px;color:#78716c;">Use your browser's print dialog → Save as PDF for best results.</span>
  </div>

  <!-- Cover -->

  <div class="cover">
    <p class="cover-label">RSVP Guest List</p>
    <h1 class="cover-title">Zhafirin &amp; Ayuni</h1>
    <p class="cover-sub">Wedding Reception — Guest Report</p>
    <p class="cover-meta">Generated on ${generatedAt} &nbsp;·&nbsp; ${rows.length} submission${rows.length !== 1 ? "s" : ""} &nbsp;·&nbsp; ${totals.totalGuests} total guests</p>
  </div>

  <!-- Stats -->

  <div class="stats-row">
    <div class="stat-cell">
      <div class="stat-label">Submissions</div>
      <div class="stat-value">${totals.submissions}</div>
    </div>
    <div class="stat-cell">
      <div class="stat-label">Total Guests</div>
      <div class="stat-value">${totals.totalGuests}</div>
    </div>
    <div class="stat-cell">
      <div class="stat-label">Adults</div>
      <div class="stat-value dark">${totals.totalAdults}</div>
    </div>
    <div class="stat-cell">
      <div class="stat-label">Children</div>
      <div class="stat-value dark">${totals.totalKids}</div>
    </div>
    <div class="stat-cell">
      <div class="stat-label">Bride / Groom</div>
      <div class="stat-value dark" style="font-size:18px;">${totals.bride} / ${totals.groom}</div>
    </div>
  </div>

  <!-- Session breakdown -->

  <div class="session-bar">
    <div class="session-cell">
      <span class="session-dot" style="background:#7A0022;"></span>
      <span class="session-cell-label">Session 1 · 3:00 PM</span>
      <span class="session-cell-val">${totals.session1} guests</span>
    </div>
    <div class="session-cell">
      <span class="session-dot" style="background:#b45309;"></span>
      <span class="session-cell-label">Session 2 · 4:30 PM</span>
      <span class="session-cell-val">${totals.session2} guests</span>
    </div>
    <div class="session-cell">
      <span class="session-dot" style="background:#1d4ed8;"></span>
      <span class="session-cell-label">Session 3 · 5:30 PM</span>
      <span class="session-cell-val">${totals.session3} guests</span>
    </div>
  </div>

  <!-- Table -->

  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Full Name</th>
          <th>Phone</th>
          <th class="center">Guests</th>
          <th class="center">Adults</th>
          <th class="center">Kids</th>
          <th>Session</th>
          <th>Guest Of</th>
          <th>Submitted</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows}
      </tbody>
    </table>
  </div>

  <!-- Footer -->

  <div class="footer">
    <span>Zhafirin &amp; Ayuni · Wedding RSVP System</span>
    <span>Total: ${totals.totalGuests} guests across ${totals.submissions} RSVPs</span>
    <span>Generated ${generatedAt}</span>
  </div>

</body>
</html>`;

```
printWindow.document.write(html);
printWindow.document.close();
```

}

async function confirmDelete(id: string) {
setDeletingIds((prev) => ({ …prev, [id]: true }));
await supabase.from(“rsvps”).delete().eq(“id”, id);
setRows((prev) => prev.filter((r) => r.id !== id));
setDeleteId(null);
setDeletingIds((prev) => {
const next = { …prev };
delete next[id];
return next;
});
}

// ── Colour maps ──
const sessionColor: Record<string, string> = {
“Session 1”: “bg-[#7A0022]/10 text-[#7A0022] border-[#7A0022]/20”,
“Session 2”: “bg-amber-50 text-amber-700 border-amber-200”,
“Session 3”: “bg-blue-50 text-blue-700 border-blue-200”,
};
const guestOfColor: Record<string, string> = {
Bride: “bg-pink-50 text-pink-700 border-pink-200”,
Groom: “bg-sky-50 text-sky-700 border-sky-200”,
};

return (
<main className="min-h-screen bg-[#FBF7F2] text-zinc-800">
{/* Background */}
<div className="pointer-events-none fixed inset-0 -z-10">
<div className="absolute inset-0 bg-[radial-gradient(1200px_800px_at_10%_10%,rgba(122,0,34,0.08),transparent_60%),radial-gradient(900px_700px_at_90%_20%,rgba(0,0,0,0.05),transparent_55%)]" />
<div className="absolute inset-0 bg-gradient-to-b from-white/70 via-[#FBF7F2]/55 to-white/80" />
</div>

```
  <div className="mx-auto max-w-5xl px-4 pb-16 pt-10 sm:px-6 sm:pt-14">

    {/* ── Header ── */}
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[#7A0022]/80">
          Admin
        </p>
        <h1 className="mt-1 font-serif text-3xl font-semibold text-zinc-900 sm:text-4xl">
          RSVP Dashboard
        </h1>
        <p className="mt-1.5 text-sm text-zinc-500">
          {loading
            ? "Loading…"
            : `${totals.submissions} submission${totals.submissions !== 1 ? "s" : ""} · ${totals.totalGuests} guests total`}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/admin/messages"
          className="inline-flex items-center gap-1.5 rounded-full bg-[#7A0022] px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#64001C] transition"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 16V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2h11l4 4-1-4h1a2 2 0 002-2z" /></svg>
          Message
        </Link>
        <Link
          href="/admin/sessions"
          className="inline-flex items-center gap-1.5 rounded-full bg-[#7A0022] px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#64001C] transition"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          Session
        </Link>
        <Link
          href="/admin/schedule"
          className="inline-flex items-center gap-1.5 rounded-full bg-[#7A0022] px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#64001C] transition"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
          Schedule
        </Link>
        <Link
          href="/admin/compact"
          className="inline-flex items-center gap-1.5 rounded-full bg-[#7A0022] px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#64001C] transition"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
          Compact
        </Link>
        <button
          onClick={exportCSV}
          disabled={rows.length === 0}
          className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white/85 px-4 py-2.5 text-sm text-zinc-800 hover:bg-white disabled:opacity-40 transition"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          Export CSV
        </button>
        {/* ── NEW: Export PDF button ── */}
        <button
          onClick={exportPDF}
          disabled={rows.length === 0}
          className="inline-flex items-center gap-1.5 rounded-full border border-[#7A0022]/30 bg-[#7A0022]/8 px-4 py-2.5 text-sm font-medium text-[#7A0022] hover:bg-[#7A0022]/15 disabled:opacity-40 transition"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /><path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6" /></svg>
          Export PDF
        </button>
        <button
          onClick={load}
          className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white/85 px-4 py-2.5 text-sm text-zinc-800 hover:bg-white transition"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          Refresh
        </button>
      </div>
    </div>

    {/* Error */}
    {error && (
      <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </div>
    )}

    {/* ── Stat Cards ── */}
    <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
      <StatCard label="Total Guests" value={totals.totalGuests} accent />
      <StatCard label="Submissions" value={totals.submissions} />
      <StatCard label="Adults" value={totals.totalAdults} />
      <StatCard label="Children" value={totals.totalKids} />
      <StatCard label="Bride / Groom" value={totals.bride} note={`/ ${totals.groom}`} />
    </div>

    {/* Session breakdown */}
    <div className="mb-8 grid grid-cols-3 gap-3">
      {(["Session 1", "Session 2", "Session 3"] as Session[]).map((s, i) => {
        const val = [totals.session1, totals.session2, totals.session3][i];
        const colors = [
          { dot: "bg-[#7A0022]", bar: "bg-[#7A0022]" },
          { dot: "bg-amber-600", bar: "bg-amber-500" },
          { dot: "bg-blue-700", bar: "bg-blue-600" },
        ][i];
        const pct = totals.totalGuests > 0 ? Math.round((val / totals.totalGuests) * 100) : 0;
        return (
          <div key={s} className="rounded-2xl border border-black/8 bg-white/75 px-4 py-3">
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`h-2 w-2 rounded-full ${colors.dot}`} />
              <p className="text-xs font-semibold text-zinc-700">{s}</p>
            </div>
            <p className="text-2xl font-bold text-zinc-900">{val} <span className="text-sm font-normal text-zinc-400">guests</span></p>
            <div className="mt-2 h-1.5 w-full rounded-full bg-zinc-100 overflow-hidden">
              <div className={`h-full rounded-full ${colors.bar} transition-all`} style={{ width: `${pct}%` }} />
            </div>
            <p className="mt-1 text-[10px] text-zinc-400">{pct}% of total</p>
          </div>
        );
      })}
    </div>

    {/* ── Filters ── */}
    <div className="mb-5 flex flex-wrap gap-2">
      {/* Session filter */}
      {(["All", "Session 1", "Session 2", "Session 3"] as SessionFilter[]).map((s) => (
        <button
          key={s}
          onClick={() => setSessionFilter(s)}
          className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${sessionFilter === s
            ? "bg-[#7A0022] text-white shadow-sm"
            : "border border-black/8 bg-white/75 text-zinc-600 hover:bg-white"
            }`}
        >
          {s}
        </button>
      ))}
      <div className="h-6 w-px self-center bg-black/8 mx-1" />
      {(["All", "Bride", "Groom"] as GuestOfFilter[]).map((g) => (
        <button
          key={g}
          onClick={() => setGuestOfFilter(g)}
          className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${guestOfFilter === g
            ? "bg-[#7A0022] text-white shadow-sm"
            : "border border-black/8 bg-white/75 text-zinc-600 hover:bg-white"
            }`}
        >
          {g === "All" ? "All Guests" : `${g}'s guests`}
        </button>
      ))}
      <div className="h-6 w-px self-center bg-black/8 mx-1" />
      {(["newest", "oldest", "name_az"] as Sort[]).map((s) => (
        <button
          key={s}
          onClick={() => setSort(s)}
          className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${sort === s
            ? "bg-zinc-800 text-white shadow-sm"
            : "border border-black/8 bg-white/75 text-zinc-600 hover:bg-white"
            }`}
        >
          {s === "newest" ? "Newest" : s === "oldest" ? "Oldest" : "A → Z"}
        </button>
      ))}
    </div>

    {/* ── Cards Grid ── */}
    {loading ? (
      <div className="py-20 text-center text-sm text-zinc-400">Loading…</div>
    ) : rows.length === 0 ? (
      <div className="py-20 text-center text-sm text-zinc-400">No RSVPs yet.</div>
    ) : (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((r) => (
          <div
            key={r.id}
            className="group relative flex flex-col gap-3 rounded-[20px] border border-black/8 bg-white/80 p-5 shadow-sm backdrop-blur transition hover:shadow-md"
          >
            {/* Name & badges */}
            <div className="flex flex-col gap-1.5">
              <p className="font-semibold text-zinc-900 leading-snug">{r.full_name ?? "—"}</p>
              <p className="text-xs text-zinc-400">{r.phone ?? "—"}</p>
              <div className="flex flex-wrap gap-1.5 mt-0.5">
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

            {/* Guest count */}
            <div className="flex gap-2">
              <GuestPill icon="👥" label="Total" value={r.guests ?? 0} />
              <GuestPill icon="🧑" label="Adults" value={r.adults ?? 0} />
              <GuestPill icon="🧒" label="Kids" value={r.kids ?? 0} />
            </div>

            {/* Message */}
            {r.message && r.message.trim().length > 0 && (
              <div className="flex items-start gap-2">
                <svg className="h-3.5 w-3.5 shrink-0 mt-0.5 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 16V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2h11l4 4-1-4h1a2 2 0 002-2z" />
                </svg>
                <p className="text-xs italic text-zinc-400 line-clamp-2">&quot;{r.message.trim()}&quot;</p>
              </div>
            )}

            {/* Footer */}
            <div className="mt-auto border-t border-black/5 pt-3 flex items-center justify-between">
              <p className="text-[11px] text-zinc-400">
                {new Date(r.created_at).toLocaleString("en-MY", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
              </p>
              <button
                onClick={() => setDeleteId(r.id)}
                disabled={deletingIds[r.id]}
                className="rounded-full px-3 py-1 text-[11px] text-zinc-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-40 transition"
              >
                {deletingIds[r.id] ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>

  {/* Confirm delete modal */}
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
```

);
}

/* ── Sub-components ── */

function GuestPill({ icon, label, value }: { icon: string; label: string; value: number }) {
return (
<div className="flex items-center gap-1 rounded-full border border-black/8 bg-zinc-50 px-2.5 py-1">
<span className="text-[11px]">{icon}</span>
<span className="text-[10px] text-zinc-400">{label}</span>
<span className="text-[11px] font-bold text-zinc-700">{value}</span>
</div>
);
}

function StatCard({ label, value, accent, note, dot }: { label: string; value: number; accent?: boolean; note?: string; dot?: string }) {
return (
<div className={`rounded-2xl border p-4 ${accent ? "border-[#7A0022]/20 bg-[#7A0022] text-white" : "border-black/8 bg-white/75 text-zinc-900" }`}>
<div className="flex items-center gap-1.5">
{dot && <span className={`h-2 w-2 rounded-full ${dot}`} />}
<p className={`text-[10px] font-semibold uppercase tracking-widest ${accent ? "text-white/70" : "text-zinc-400"}`}>
{label}
</p>
</div>
<p className={`mt-1 text-2xl font-bold ${accent ? "text-white" : "text-zinc-900"}`}>
{value}{note && <span className="text-base font-normal ml-1 opacity-60">{note}</span>}
</p>
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
<svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
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
const s = String(v ?? “”);
if (/[”,\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
return s;
}