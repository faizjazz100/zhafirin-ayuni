"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import FloralBackground from "@/src/app/components/FloralBackground";
import { useRef, useState, Suspense } from "react";
import { toPng } from "html-to-image";

const SESSION_TIME: Record<string, string> = {
  "Session 1": "3:00 PM",
  "Session 2": "4:30 PM",
  "Session 3": "5:30 PM",
};

function SuccessContent() {
  const searchParams = useSearchParams();
  const name = searchParams.get("name") ?? "";
  const session = searchParams.get("session") ?? "";
  const guests = searchParams.get("guests") ?? "1";
  const adults = searchParams.get("adults") ?? "1";
  const kids = searchParams.get("kids") ?? "0";
  const guestOf = searchParams.get("guestOf") ?? "";
  const time = SESSION_TIME[session] ?? "";

  const cardRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  async function saveImage() {
    if (!cardRef.current) return;
    setSaving(true);
    try {
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 3 });
      setImageUrl(dataUrl);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen text-zinc-800">
      <FloralBackground />
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(1200px_800px_at_10%_10%,rgba(122,0,34,0.10),transparent_60%),radial-gradient(900px_700px_at_90%_20%,rgba(176,16,62,0.08),transparent_55%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-[#FBF7F2]/55 to-white/80" />
      </div>

      <div className="mx-auto flex min-h-screen flex-col items-center justify-center px-5 py-16 sm:px-6">

        {/* Confirmation text */}
        <div className="mb-8 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[#7A0022]/80">Thank You</p>
          <h1 className="mt-2 font-serif text-3xl font-semibold text-zinc-900 sm:text-4xl">{name || "See you there!"}</h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-500">Your RSVP has been received.</p>
        </div>

        {/* ── The Card ── */}
        <div
          ref={cardRef}
          className="w-[340px] sm:w-[380px] overflow-hidden rounded-[28px] bg-[#FBF7F2] shadow-[0_20px_70px_rgba(0,0,0,0.15)]"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          {/* Top crimson band */}
          <div className="bg-[#7A0022] px-7 py-6 text-center">
            <p className="text-[10px] font-sans font-semibold uppercase tracking-[0.35em] text-white/60">You&apos;re coming!</p>
            <p
              className="mt-2 text-3xl text-white"
              style={{ fontFamily: "'Great Vibes', Georgia, cursive", letterSpacing: "0.02em" }}
            >
              Zhafirin &amp; Ayuni
            </p>
            <p className="mt-1.5 font-sans text-[11px] font-semibold uppercase tracking-[0.28em] text-white/70">
              2 May 2026 &nbsp;·&nbsp; Saturday
            </p>
          </div>

          {/* Thin decorative line */}
          <div className="flex items-center gap-3 px-7 py-3">
            <div className="h-px flex-1 bg-[#7A0022]/15" />
            <span className="text-[#7A0022]/40 text-xs">✦</span>
            <div className="h-px flex-1 bg-[#7A0022]/15" />
          </div>

          {/* Guest name */}
          <div className="px-7 pb-1 text-center">
            <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.30em] text-zinc-400">Guest</p>
            <p className="mt-1 text-xl font-semibold text-zinc-900">{name || "—"}</p>
            {guestOf && (
              <span className={`mt-1.5 inline-block rounded-full px-3 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-wider ${guestOf === "Bride" ? "bg-rose-50 text-rose-700" : "bg-slate-100 text-slate-600"}`}>
                {guestOf}&apos;s Guest
              </span>
            )}
          </div>

          {/* Details grid */}
          <div className="mx-7 mt-4 grid grid-cols-2 gap-2.5">
            <DetailTile label="Session" value={session || "—"} />
            <DetailTile label="Time" value={time || "—"} />
            <DetailTile label="Guests" value={`${guests} pax`} />
            <DetailTile label="Adults / Kids" value={`${adults} / ${kids}`} />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 px-7 py-4">
            <div className="h-px flex-1 bg-[#7A0022]/12" />
            <span className="text-[#7A0022]/30 text-xs">✦</span>
            <div className="h-px flex-1 bg-[#7A0022]/12" />
          </div>

          {/* Venue */}
          <div className="px-7 pb-1">
            <div className="rounded-2xl border border-[#7A0022]/10 bg-white/70 p-4 text-center">
              <p className="font-sans text-[9px] font-semibold uppercase tracking-[0.30em] text-zinc-400">Venue</p>
              <p className="mt-1 font-sans text-sm font-semibold text-zinc-900">Hacienda A-Park</p>
              <p className="mt-0.5 font-sans text-[11px] leading-relaxed text-zinc-500">
                3275, Jalan Pulau Meranti,<br />47100 Puchong, Selangor
              </p>
            </div>
          </div>

          {/* Attire */}
          <div className="px-7 pt-3 pb-1">
            <div className="rounded-2xl border border-[#7A0022]/10 bg-white/70 p-4 text-center">
              <p className="font-sans text-[9px] font-semibold uppercase tracking-[0.30em] text-zinc-400">Wedding Attire</p>
              <p className="mt-1 font-sans text-sm font-semibold text-zinc-900">Any colour except silver</p>
            </div>
          </div>

          {/* Bottom */}
          <div className="px-7 py-5 text-center">
            <p className="font-sans text-[11px] font-semibold tracking-[0.28em] text-[#7A0022]">#ZHAFYUNI</p>
          </div>
        </div>

        {/* Save button */}
        <button
          onClick={saveImage}
          disabled={saving}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#7A0022] px-6 py-3 text-sm font-medium text-white shadow-[0_12px_26px_rgba(122,0,34,0.20)] hover:bg-[#64001C] disabled:opacity-60 transition"
        >
          {saving ? (
            <>
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Generating…
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Save Card
            </>
          )}
        </button>

        <div className="mt-4 flex gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white/85 px-5 py-2.5 text-sm text-zinc-700 hover:bg-white transition"
          >
            Back to Home
          </Link>
        </div>
      </div>

      {/* ── Image modal ── */}
      {imageUrl && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm px-5"
          onClick={() => setImageUrl(null)}
        >
          <div className="mb-4 text-center" onClick={(e) => e.stopPropagation()}>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/60">Save to Photos</p>
            <p className="mt-1 text-white font-medium">
              {/iPhone|iPad|iPod/i.test(typeof navigator !== "undefined" ? navigator.userAgent : "")
                ? "Long press the image → Save to Photos"
                : "Long press the image → Save image"}
            </p>
          </div>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt="Your RSVP card"
            className="max-h-[70vh] w-auto rounded-[20px] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />

          <button
            onClick={() => setImageUrl(null)}
            className="mt-5 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-sm text-white hover:bg-white/20 transition"
          >
            Close
          </button>
        </div>
      )}
    </main>
  );
}

function DetailTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#7A0022]/10 bg-white/70 px-3 py-2.5 text-center">
      <p className="font-sans text-[9px] font-semibold uppercase tracking-[0.25em] text-zinc-400">{label}</p>
      <p className="mt-0.5 font-sans text-sm font-semibold text-zinc-900">{value}</p>
    </div>
  );
}

export default function RsvpSuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}
