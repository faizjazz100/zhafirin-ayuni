"use client";

import dynamic from "next/dynamic";
import Link from "next/link";

const RouteEditor = dynamic(() => import("./RouteEditor"), {
    ssr: false,
    loading: () => (
        <div className="flex h-[500px] items-center justify-center rounded-[28px] bg-white/65">
            <p className="text-sm text-zinc-400">Loading map…</p>
        </div>
    ),
});

export default function AdminRoutePage() {
    return (
        <main className="min-h-screen bg-[#FBF7F2] text-zinc-800">
            {/* Background */}
            <div className="pointer-events-none fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-[radial-gradient(1200px_800px_at_10%_10%,rgba(122,0,34,0.08),transparent_60%),radial-gradient(900px_700px_at_90%_20%,rgba(0,0,0,0.05),transparent_55%)]" />
                <div className="absolute inset-0 bg-linear-to-b from-white/70 via-[#FBF7F2]/55 to-white/80" />
            </div>

            <div className="mx-auto max-w-4xl px-4 pb-16 pt-10 sm:px-6 sm:pt-14">

                {/* Header */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[#7A0022]/80">Admin</p>
                        <h1 className="mt-1 font-serif text-3xl font-semibold text-zinc-900 sm:text-4xl">Direction Route</h1>
                        <p className="mt-1 text-sm text-zinc-500">Draw and save the route shown on the venue page.</p>
                    </div>
                    <div className="shrink-0">
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

                {/* Editor card */}
                <div className="overflow-hidden rounded-[28px] border border-white/55 bg-white/65 shadow-[0_20px_70px_rgba(0,0,0,0.10)]">
                    <RouteEditor />
                </div>

                {/* How to use */}
                <div className="mt-6 rounded-[28px] border border-white/55 bg-white/65 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.07)]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[#7A0022]/80">How to use</p>
                    <ul className="mt-3 space-y-2 text-sm text-zinc-600">
                        <li className="flex gap-2"><span className="mt-0.5 text-[#7A0022]">①</span> Click on the map to place waypoints in order</li>
                        <li className="flex gap-2"><span className="mt-0.5 text-[#7A0022]">②</span> The last point is automatically the destination</li>
                        <li className="flex gap-2"><span className="mt-0.5 text-[#7A0022]">③</span> Add optional remarks and choose label position per point</li>
                        <li className="flex gap-2"><span className="mt-0.5 text-[#7A0022]">④</span> Hit <strong>Save Route</strong> — it goes live on the venue page instantly</li>
                    </ul>
                </div>

            </div>
        </main>
    );
}
