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

  // Sessions visible in the picker
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
    <form onSubmit={submit} className="mt-8 space-y-5">
      <div>
        <label className="text-sm text-zinc-600">Preferred Name</label>
        <input
          className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white p-3.5 outline-none focus:border-zinc-400"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          autoComplete="name"
          required
        />
      </div>

      <div>
        <label className="text-sm text-zinc-600">Phone Number</label>
        <input
          className={[
            "mt-2 w-full rounded-2xl border bg-white p-3.5 outline-none",
            phoneError ? "border-red-400 focus:border-red-500" : "border-zinc-200 focus:border-zinc-400",
          ].join(" ")}
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            setPhoneError("");
          }}
          placeholder="e.g. 0123456789, +60123456789, +6591234567"
          inputMode="tel"
          autoComplete="tel"
          required
        />
        {phoneError && <p className="mt-2 text-sm text-red-600">{phoneError}</p>}
      </div>

      <div>
        <label className="text-sm text-zinc-600">Guest of</label>
        <select
          className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-3 py-3 text-sm"
          value={guestOf}
          onChange={(e) => setGuestOf(e.target.value as GuestOf)}
        >
          <option value="Groom">Groom (Zhafirin)</option>
          <option value="Bride">Bride (Ayuni)</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="text-sm text-zinc-600">Session</label>

          <select
            className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-3 py-3 text-sm disabled:bg-zinc-100"
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
            <p className="mt-2 text-xs text-zinc-500">
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

        <div className="mt-3">
          <p className="text-sm text-zinc-500">Selected Time</p>
          <div className="mt-1 inline-flex items-center rounded-full bg-[#7A0022]/10 px-4 py-1.5 text-sm font-medium text-[#7A0022]">
            {SESSION_TIME[selectedSession]}
          </div>
        </div>
      </div>

      <div>
        <label className="text-sm text-zinc-600">Number of Guests</label>
        <div className="mt-2 grid grid-cols-5 gap-2">
          {guestOptions.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => handleGuestsClick(n)}
              className={[
                "rounded-2xl border px-4 py-3 text-sm transition",
                guests === n
                  ? "border-[#7A0022] bg-[#7A0022] text-white"
                  : "border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50",
              ].join(" ")}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm mb-1 text-zinc-600">Adults</label>
          <select
            className="w-full rounded-2xl border border-zinc-200 bg-white px-3 py-3 text-sm"
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
          <label className="block text-sm mb-1 text-zinc-600">Kids</label>
          <input
            className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-3 text-sm text-zinc-700"
            value={kids}
            readOnly
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700">
          Message or wish (optional)
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          maxLength={400}
          className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-zinc-400"
          placeholder="Write a short wish..."
        />
        <p className="mt-1 text-xs text-zinc-500">{message.length}/400</p>
      </div>

      <button
        type="submit"
        disabled={submitting || loadingSessions}
        className={[
          "w-full rounded-2xl p-3.5 text-white transition",
          submitting || loadingSessions ? "bg-[#7A0022]" : "bg-[#7A0022] hover:opacity-90",
        ].join(" ")}
      >
        {submitting ? "Submitting..." : loadingSessions ? "Loading sessions..." : "Submit RSVP"}
      </button>

      {status && (
        <div
          className={[
            "rounded-2xl border p-4 text-sm",
            status.type === "ok"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : status.type === "err"
                ? "border-red-200 bg-red-50 text-red-900"
                : "border-zinc-200 bg-white/70 text-zinc-700",
          ].join(" ")}
        >
          {status.type === "ok" ? "✅ " : status.type === "err" ? "❌ " : "⏳ "}
          {status.text}
        </div>
      )}
    </form>
  );
}