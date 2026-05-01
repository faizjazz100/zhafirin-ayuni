"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export type Session = "Session 1" | "Session 2" | "Session 3";
type GuestOf = "Bride" | "Groom";

type SessionLimitRow = {
  session_name: Session;
  guest_limit: number;
};

type RsvpUsageRow = {
  session: Session | null;
  guests: number | null;
};

type SessionAvailability = {
  [key in Session]: { remaining: number; limit: number; used: number };
};

type Props = {
  lockedSession?: Session | null;
};

const SESSION_OPTIONS: Session[] = ["Session 1", "Session 2", "Session 3"];

const SESSION_TIME: Record<string, string> = {
  "Session 1": "3:00 PM",
  "Session 2": "4:30 PM",
  "Session 3": "5:30 PM",
};

function normalizePhone(input: string) {
  let cleaned = input.trim().replace(/[^\d+]/g, "");

  if (cleaned.includes("+")) {
    cleaned = "+" + cleaned.replace(/\+/g, "");
  }

  if (/^01\d{8,9}$/.test(cleaned)) {
    return `+60${cleaned.slice(1)}`;
  }

  if (/^601\d{8,9}$/.test(cleaned)) {
    return `+${cleaned}`;
  }

  return cleaned;
}

function isValidInternationalPhone(phone: string) {
  return /^\+[1-9]\d{7,14}$/.test(phone);
}

function FieldLabel({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-[10px] font-semibold uppercase tracking-[0.38em] text-zinc-400"
    >
      {children}
    </label>
  );
}

const inputBase =
  "mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3.5 text-base text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-[#7A0022]/40 focus:ring-2 focus:ring-[#7A0022]/8";

const selectBase =
  "mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3.5 text-base text-zinc-900 outline-none transition focus:border-[#7A0022]/40 focus:ring-2 focus:ring-[#7A0022]/8";

function SectionDivider() {
  return <div className="h-px bg-black/5" />;
}

export default function RsvpForm({ lockedSession }: Props) {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedSession, setSelectedSession] = useState<Session>(
    lockedSession ?? "Session 2"
  );
  const [guestOf, setGuestOf] = useState<GuestOf>("Groom");

  const [guests, setGuests] = useState(1);
  const [adults, setAdults] = useState(1);
  const kids = useMemo(() => Math.max(0, guests - adults), [guests, adults]);

  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<null | { type: "ok" | "err" | "info"; text: string }>(null);
  const [phoneError, setPhoneError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [sessionAvailability, setSessionAvailability] = useState<SessionAvailability>({
    "Session 1": { remaining: 0, limit: 0, used: 0 },
    "Session 2": { remaining: 0, limit: 0, used: 0 },
    "Session 3": { remaining: 0, limit: 0, used: 0 },
  });
  const [loadingSessions, setLoadingSessions] = useState(true);

  const guestOptions = [1, 2, 3, 4, 5, 6];

  const adultOptions = useMemo(
    () => Array.from({ length: guests }, (_, i) => i + 1),
    [guests]
  );

  const visibleSessions = lockedSession
    ? [lockedSession]
    : SESSION_OPTIONS.filter((s) => s !== "Session 1");

  async function loadSessionAvailability() {
    setLoadingSessions(true);

    const [{ data: limits, error: limitsError }, { data: rsvps, error: rsvpsError }] =
      await Promise.all([
        supabase.from("session_limits").select("session_name, guest_limit"),
        supabase.from("rsvps").select("session, guests"),
      ]);

    if (limitsError || rsvpsError) {
      setLoadingSessions(false);
      return;
    }

    const usageMap: { [key in Session]: number } = {
      "Session 1": 0,
      "Session 2": 0,
      "Session 3": 0,
    };

    ((rsvps ?? []) as RsvpUsageRow[]).forEach((row) => {
      if (!row.session) return;
      usageMap[row.session] += Number(row.guests) || 0;
    });

    const nextAvailability: SessionAvailability = {
      "Session 1": { remaining: 0, limit: 0, used: 0 },
      "Session 2": { remaining: 0, limit: 0, used: 0 },
      "Session 3": { remaining: 0, limit: 0, used: 0 },
    };

    ((limits ?? []) as SessionLimitRow[]).forEach((row) => {
      const used = usageMap[row.session_name] || 0;
      const limit = Number(row.guest_limit) || 0;

      nextAvailability[row.session_name] = {
        used,
        limit,
        remaining: Math.max(0, limit - used),
      };
    });

    setSessionAvailability(nextAvailability);
    setLoadingSessions(false);
    return nextAvailability;
  }

  useEffect(() => {
    async function init() {
      const availability = await loadSessionAvailability();
      if (!lockedSession && availability) {
        const autoSelect = SESSION_OPTIONS
          .filter((s) => s !== "Session 1")
          .find((s) => (availability[s]?.remaining ?? 0) > 0);
        if (autoSelect) setSelectedSession(autoSelect);
      }
    }
    init();
  }, []);

  function findNextAvailableSession(guestCount: number) {
    return visibleSessions.find(
      (session) => (sessionAvailability[session]?.remaining ?? 0) >= guestCount
    );
  }

  function handleGuestsClick(n: number) {
    setGuests(n);
    setAdults(n);

    if (!lockedSession) {
      const currentRemaining = sessionAvailability[selectedSession]?.remaining ?? 0;
      if (currentRemaining < n) {
        const nextAvailable = findNextAvailableSession(n);
        if (nextAvailable) {
          setSelectedSession(nextAvailable);
        }
      }
    }
  }

  function handleAdultsChange(nextAdults: number) {
    const clamped = Math.max(1, Math.min(nextAdults, guests));
    setAdults(clamped);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;

    setStatus(null);
    setPhoneError("");

    const name = fullName.trim();
    const cleanedPhone = normalizePhone(phone);

    if (!name) {
      setStatus({ type: "err", text: "Please enter your full name." });
      return;
    }

    if (!isValidInternationalPhone(cleanedPhone)) {
      setPhoneError("Please enter a valid phone number with country code, e.g. +60123456789.");
      return;
    }

    const remaining = sessionAvailability[selectedSession]?.remaining ?? 0;
    if (remaining < guests) {
      setStatus({
        type: "err",
        text: `Sorry, ${selectedSession} does not have enough remaining slots.`,
      });
      return;
    }

    const trimmedMessage = message.trim();
    const safeMessage = trimmedMessage.length > 0 ? trimmedMessage.slice(0, 400) : null;

    setSubmitting(true);
    setStatus({ type: "info", text: "Submitting..." });

    const { error } = await supabase.from("rsvps").insert({
      full_name: name,
      phone: cleanedPhone,
      guests,
      adults,
      kids,
      session: selectedSession,
      guest_of: guestOf,
      message: safeMessage,
      show_message: false,
    });

    if (error) {
      setSubmitting(false);
      setStatus({ type: "err", text: `Something went wrong: ${error.message}` });
      return;
    }

    await loadSessionAvailability();
    setSubmitting(false);
    const params = new URLSearchParams({
      name,
      session: selectedSession,
      guests: String(guests),
      adults: String(adults),
      kids: String(kids),
      guestOf,
    });
    router.push(`/rsvp/success?${params.toString()}`);
  }

  return (
    <form onSubmit={submit} className="mt-8 space-y-7">

      {/* Personal info */}
      <div className="space-y-5">
        <div>
          <FieldLabel htmlFor="rsvp-name">Preferred Name</FieldLabel>
          <input
            id="rsvp-name"
            className={inputBase}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            autoComplete="name"
            aria-required="true"
            required
          />
        </div>

        <div>
          <FieldLabel htmlFor="rsvp-phone">Phone Number</FieldLabel>
          <input
            id="rsvp-phone"
            className={[
              inputBase,
              phoneError ? "border-red-400 focus:border-red-400 focus:ring-red-500/10" : "",
            ].join(" ")}
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              setPhoneError("");
            }}
            placeholder="e.g. 0123456789 or +60123456789"
            inputMode="tel"
            autoComplete="tel"
            aria-required="true"
            aria-describedby={phoneError ? "rsvp-phone-error" : undefined}
            required
          />
          {phoneError && (
            <p id="rsvp-phone-error" className="mt-2 text-xs text-red-600" role="alert">
              {phoneError}
            </p>
          )}
        </div>

        <div>
          <FieldLabel htmlFor="rsvp-guest-of">Guest of</FieldLabel>
          <select
            id="rsvp-guest-of"
            className={selectBase}
            value={guestOf}
            onChange={(e) => setGuestOf(e.target.value as GuestOf)}
          >
            <option value="Groom">Groom (Zhafirin)</option>
            <option value="Bride">Bride (Ayuni)</option>
          </select>
        </div>
      </div>

      <SectionDivider />

      {/* Session */}
      <div className="space-y-4">
        <div>
          <FieldLabel htmlFor="rsvp-session">Session</FieldLabel>
          <select
            id="rsvp-session"
            className={`${selectBase} disabled:bg-zinc-50 disabled:text-zinc-400`}
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value as Session)}
            disabled={loadingSessions}
          >
            {visibleSessions.map((session) => {
              const info = sessionAvailability[session];
              const remaining = info?.remaining ?? 0;
              const disabled = remaining < guests;

              return (
                <option key={session} value={session} disabled={disabled}>
                  {session} ({SESSION_TIME[session]}){" "}
                  {loadingSessions ? "" : disabled ? "- Full" : `- ${remaining} left`}
                </option>
              );
            })}
          </select>

          {!lockedSession && !loadingSessions && (
            <p className="mt-2 text-xs text-zinc-400">
              Choose a session with enough slots for {guests} guest{guests > 1 ? "s" : ""}.
            </p>
          )}

          {!lockedSession && !loadingSessions && (sessionAvailability[selectedSession]?.remaining ?? 0) < guests && (
            <p className="mt-2 text-xs text-red-600">
              This session does not have enough slots for {guests} guest{guests > 1 ? "s" : ""}.
              Please choose another session.
            </p>
          )}
        </div>

        {/* Selected time badge */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-semibold uppercase tracking-[0.38em] text-zinc-400">Selected Time</span>
          <span className="inline-flex items-center rounded-full bg-[#7A0022]/10 px-3.5 py-1 text-xs font-semibold tracking-wide text-[#7A0022]">
            {SESSION_TIME[selectedSession]}
          </span>
        </div>
      </div>

      <SectionDivider />

      {/* Guests */}
      <div className="space-y-5">
        <div>
          <FieldLabel>Number of Guests</FieldLabel>
          <div className="mt-2 grid grid-cols-6 gap-2">
            {guestOptions.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => handleGuestsClick(n)}
                className={[
                  "rounded-2xl border py-3 text-sm font-medium transition",
                  guests === n
                    ? "border-[#7A0022] bg-[#7A0022] text-white shadow-[0_6px_16px_rgba(122,0,34,0.22)]"
                    : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50",
                ].join(" ")}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel htmlFor="rsvp-adults">Adults</FieldLabel>
            <select
              id="rsvp-adults"
              className={selectBase}
              value={adults}
              onChange={(e) => handleAdultsChange(Number(e.target.value))}
            >
              {adultOptions.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div>
            <FieldLabel htmlFor="rsvp-kids">
              Kids <span className="normal-case font-normal tracking-normal text-zinc-300">(auto)</span>
            </FieldLabel>
            <input
              id="rsvp-kids"
              className="mt-2 w-full cursor-default rounded-2xl border border-zinc-100 bg-zinc-50 px-4 py-3.5 text-base text-zinc-400 select-none"
              value={kids}
              readOnly
              aria-readonly="true"
              tabIndex={-1}
            />
          </div>
        </div>
      </div>

      <SectionDivider />

      {/* Message */}
      <div>
        <FieldLabel htmlFor="rsvp-message">
          Message or wish{" "}
          <span className="normal-case font-normal tracking-normal text-zinc-300">(optional)</span>
        </FieldLabel>
        <textarea
          id="rsvp-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          maxLength={400}
          className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3.5 text-base text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-[#7A0022]/40 focus:ring-2 focus:ring-[#7A0022]/8 resize-none"
          placeholder="Write a short wish..."
        />
        <p className="mt-1.5 text-right text-[11px] text-zinc-300" aria-live="polite">
          {message.length}/400
        </p>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting || loadingSessions}
        className="w-full rounded-full bg-[#7A0022] py-4 text-[11px] font-semibold uppercase tracking-[0.4em] text-white shadow-[0_14px_32px_rgba(122,0,34,0.28)] transition hover:bg-[#64001C] disabled:opacity-60"
      >
        {submitting ? "Submitting..." : loadingSessions ? "Loading sessions..." : "Submit RSVP"}
      </button>

      {status && (
        <div
          role="status"
          aria-live="polite"
          className={[
            "flex items-start gap-3 rounded-2xl border p-4 text-sm",
            status.type === "ok"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : status.type === "err"
                ? "border-red-200 bg-red-50 text-red-900"
                : "border-zinc-200 bg-white/70 text-zinc-700",
          ].join(" ")}
        >
          {status.type === "ok" ? (
            <svg className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          ) : status.type === "err" ? (
            <svg className="mt-0.5 h-4 w-4 shrink-0 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          ) : (
            <svg className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-zinc-500" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          )}
          <span>{status.text}</span>
        </div>
      )}
    </form>
  );
}
