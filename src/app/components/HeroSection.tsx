"use client";

import { motion } from "framer-motion";
import { alexBrush } from "@/lib/fonts";
import { useEffect, useState } from "react";

function FadeUp({
  delay = 0,
  children,
  className,
}: {
  delay?: number;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const SESSIONS = [
  { label: "Session 1", start: "2026-05-02T15:00:00+08:00", end: "2026-05-02T16:30:00+08:00", display: "3:00 PM – 4:30 PM" },
  { label: "Session 2", start: "2026-05-02T16:30:00+08:00", end: "2026-05-02T17:30:00+08:00", display: "4:30 PM – 5:30 PM" },
  { label: "Session 3", start: "2026-05-02T17:30:00+08:00", end: "2026-05-02T20:00:00+08:00", display: "5:30 PM – 8:00 PM" },
];


function getTimeLeft(target: string) {
  const diff = Math.max(0, new Date(target).getTime() - Date.now());
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
    done: diff === 0,
  };
}

function HappeningNow() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 5000);
    return () => clearInterval(id);
  }, []);

  const allEnded = now >= new Date(SESSIONS[SESSIONS.length - 1].end);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center gap-3"
    >
      {/* Pulse badge */}
      <div className="relative flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-sm">
        {!allEnded && (
          <>
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#F4D7DA] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
            </span>
          </>
        )}
        <span className="text-[10px] font-semibold uppercase tracking-[0.38em] text-white">
          {allEnded ? "Thank you for coming!" : "Happening Now"}
        </span>
      </div>

    </motion.div>
  );
}

function Countdown({ target }: { target: string }) {
  const [t, setT] = useState<ReturnType<typeof getTimeLeft> | null>(null);

  useEffect(() => {
    const id = setInterval(() => setT(getTimeLeft(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (!t) return null;

  if (t.done) return <HappeningNow />;

  const units = [
    { value: t.days, label: "DAYS" },
    { value: t.hours, label: "HRS" },
    { value: t.minutes, label: "MIN" },
    { value: t.seconds, label: "SEC" },
  ];

  return (
    <div className="flex items-end gap-3 sm:gap-4">
      {units.map(({ value, label }) => (
        <div key={label} className="flex flex-col items-center gap-1.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm sm:h-14 sm:w-14">
            <span className="text-xl font-semibold tabular-nums text-white sm:text-2xl">
              {String(value).padStart(2, "0")}
            </span>
          </div>
          <span className="text-[7px] font-semibold tracking-[0.28em] text-white/45 sm:text-[8px]">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function HeroSection({

  couple,
  date,
  location,
  hashtag,
}: {
  couple: string;
  date: string;
  location: string;
  hashtag: string;
  rsvpHref: string;
}) {
  return (
    <section className="relative h-[100svh] min-h-[620px] overflow-hidden">
      {/* Video background */}
      <video
        src="/couple_animation.mp4"
        autoPlay
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 h-full w-full object-cover object-[center_30%]"
      />

      {/* Gradient layers */}
      <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-black/55 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-4/5 bg-gradient-to-t from-black/88 via-black/45 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_80%_at_50%_60%,transparent_35%,rgba(0,0,0,0.25))]" />

      {/* Text content */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center pb-24 px-5 text-center text-white sm:pb-28">
        <FadeUp delay={0.35}>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-px w-10 bg-white/22" />
            <div className="h-1 w-1 rotate-45 bg-white/35" />
            <div className="h-px w-10 bg-white/22" />
          </div>
        </FadeUp>

        <FadeUp delay={0.65}>
          <h1
            className={`${alexBrush.className} mt-2 whitespace-nowrap text-[clamp(2.8rem,10vw,6rem)] leading-tight text-white`}
            style={{ textShadow: "0 2px 24px rgba(0,0,0,0.55)" }}
          >
            {couple}
          </h1>
        </FadeUp>

        <FadeUp delay={0.82}>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-px w-10 bg-white/22" />
            <div className="h-1 w-1 rotate-45 bg-[#F4D7DA]/50" />
            <div className="h-px w-10 bg-white/22" />
          </div>
        </FadeUp>

        <FadeUp delay={0.96}>
          <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.44em] text-white/75">
            {date}&nbsp;&nbsp;·&nbsp;&nbsp;Saturday
          </p>
        </FadeUp>

        <FadeUp delay={1.08}>
          <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.26em] text-white/45">
            {location}
          </p>
        </FadeUp>

        <FadeUp delay={1.24}>
          <div className="mt-7">
            <Countdown target="2026-05-02T15:00:00+08:00" />
          </div>
        </FadeUp>
      </div>

      {/* Hashtag */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 1 }}
        className="absolute bottom-8 right-5 text-[9px] font-semibold tracking-[0.35em] text-[#F4D7DA]/55 sm:right-8"
      >
        {hashtag}
      </motion.p>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-7 left-1/2 -translate-x-1/2"
        aria-hidden="true"
      >
        <motion.div
          animate={{ y: [0, 7, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5 text-white/28"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  );
}
