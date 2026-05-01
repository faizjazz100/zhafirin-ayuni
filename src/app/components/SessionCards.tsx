"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const EVENT_DATE = "2026-05-02";

const SESSIONS = [
  { label: "Session 1", start: "15:00", end: "16:30" },
  { label: "Session 2", start: "16:30", end: "17:30" },
  { label: "Session 3", start: "17:30", end: "20:00" },
];

const DISPLAY_TIMES = [
  { start: "3:00 PM", end: "4:30 PM" },
  { start: "4:30 PM", end: "5:30 PM" },
  { start: "5:30 PM", end: "8:00 PM" },
];

function parseSessionDate(timeStr: string) {
  const [h, m] = timeStr.split(":").map(Number);
  const d = new Date(`${EVENT_DATE}T00:00:00`);
  d.setHours(h, m, 0, 0);
  return d;
}

type Status = "upcoming" | "ongoing" | "ended";

function getStatus(start: Date, end: Date, now: Date): Status {
  if (now >= end) return "ended";
  if (now >= start) return "ongoing";
  return "upcoming";
}

function formatCountdown(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;
  if (m > 0) return `${m}m ${String(s).padStart(2, "0")}s`;
  return `${s}s`;
}

export default function SessionCards() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div>
    <div className="grid grid-cols-3 gap-3 sm:gap-4">
      {SESSIONS.map((s, i) => {
        const startDate = parseSessionDate(s.start);
        const endDate = parseSessionDate(s.end);
        const display = DISPLAY_TIMES[i];

        const status: Status = now ? getStatus(startDate, endDate, now) : "upcoming";
        const msToStart = now ? startDate.getTime() - now.getTime() : null;
        const msToEnd = now ? endDate.getTime() - now.getTime() : null;

        return (
          <div
            key={s.label}
            className={[
              "relative flex flex-col items-center overflow-hidden rounded-[20px] border px-3 py-4 text-center shadow-[0_8px_32px_rgba(0,0,0,0.10),0_0_0_1px_rgba(122,0,34,0.05)] transition-all sm:rounded-[24px] sm:px-5 sm:py-5",
              status === "ongoing"
                ? "border-[#7A0022]/30 bg-[#7A0022] text-white"
                : "border-white/60 bg-white",
            ].join(" ")}
          >
            {/* Ongoing pulse ring */}
            {status === "ongoing" && (
              <span className="absolute inset-0 animate-ping rounded-[20px] bg-[#7A0022]/20 sm:rounded-[24px]" style={{ animationDuration: "2s" }} />
            )}

            <p
              className={[
                "relative text-[8px] font-semibold uppercase tracking-[0.4em] sm:text-[9px]",
                status === "ongoing" ? "text-white/80" : "text-[#7A0022]/70",
              ].join(" ")}
            >
              {s.label}
            </p>

            <div
              className={[
                "relative mt-1.5 h-px w-8",
                status === "ongoing" ? "bg-white/25" : "bg-[#7A0022]/12",
              ].join(" ")}
            />

            <p
              className={[
                "relative mt-2 text-[11px] font-semibold leading-snug sm:text-[13px]",
                status === "ongoing" ? "text-white" : "text-zinc-800",
              ].join(" ")}
            >
              {display.start}
            </p>
            <p
              className={[
                "relative text-[10px] sm:text-[11px]",
                status === "ongoing" ? "text-white/50" : "text-zinc-400",
              ].join(" ")}
            >
              –
            </p>
            <p
              className={[
                "relative text-[11px] font-semibold leading-snug sm:text-[13px]",
                status === "ongoing" ? "text-white" : "text-zinc-800",
              ].join(" ")}
            >
              {display.end}
            </p>

            {/* Status badge */}
            <div className="relative mt-3 w-full">
              {status === "ended" && (
                <span className="inline-block rounded-full bg-zinc-100 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.3em] text-zinc-400">
                  Session Ended
                </span>
              )}
              {status === "ongoing" && (
                <span className="inline-block rounded-full bg-white/20 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.3em] text-white">
                  Ongoing
                </span>
              )}
              {status === "upcoming" && now && msToStart !== null && (
                <span className="inline-block rounded-full bg-[#7A0022]/6 px-2 py-1 text-[9px] font-mono font-semibold tabular-nums text-[#7A0022]/80">
                  {formatCountdown(msToStart)}
                </span>
              )}
              {status === "ongoing" && now && msToEnd !== null && (
                <span className="mt-1 block text-[8px] text-white/60 font-mono tabular-nums">
                  ends in {formatCountdown(msToEnd)}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
    <div className="mt-4 text-center">
      <Link
        href="/session"
        className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#7A0022]/70 transition hover:text-[#7A0022]"
      >
        Forgot your session? →
      </Link>
    </div>
    </div>
  );
}
