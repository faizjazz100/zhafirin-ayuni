"use client";

import { useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";


export type Session = "Public" | "Private";

function normalizePhone(input: string) {
  // Keep + for international, remove spaces/dashes
  const cleaned = input.trim().replace(/[^\d+]/g, "");

  // Convert common Malaysian formats to +60XXXXXXXXXX
  // Examples:
  // 0123456789 -> +60123456789
  // 60123456789 -> +60123456789
  // +60123456789 -> +60123456789
  if (cleaned.startsWith("+60")) return cleaned;
  if (cleaned.startsWith("60")) return `+${cleaned}`;
  if (cleaned.startsWith("0")) return `+60${cleaned.slice(1)}`;
  return cleaned;
}

function isValidMYPhoneE164(phone: string) {
  // +601 followed by 8-9 digits (mobile formats)
  return /^\+601\d{8,9}$/.test(phone);
}

type Props = {
  session: Session;
};

export default function RsvpForm({ session }: Props) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const router = useRouter();

  const [guests, setGuests] = useState(1);
  const [adults, setAdults] = useState(1);
  const kids = useMemo(() => Math.max(0, guests - adults), [guests, adults]);

  const [message, setMessage] = useState("");

  const [status, setStatus] = useState<null | { type: "ok" | "err" | "info"; text: string }>(null);
  const [phoneError, setPhoneError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const guestOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  // Adults: enforce min 1 adult (typical RSVP assumption)
  const adultOptions = useMemo(
    () => Array.from({ length: guests }, (_, i) => i + 1),
    [guests]
  );

  function handleGuestsClick(n: number) {
    setGuests(n);
    setAdults((prev) => Math.min(Math.max(prev, 1), n)); // clamp to [1..n]
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

    if (!isValidMYPhoneE164(cleanedPhone)) {
      setPhoneError("Please enter a valid Malaysian number (e.g. 0123456789 or +60123456789).");
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
      session,
      message: safeMessage,
      show_message: false,
    });

    setSubmitting(false);

    if (error) {
      setStatus({ type: "err", text: `Something went wrong: ${error.message}` });
      return;
    }
    router.push(`/rsvp/success?name=${encodeURIComponent(name)}`);
  }

  return (
    <form onSubmit={submit} className="mt-8 space-y-5">
      <div>
        <label className="text-sm text-zinc-600">Full Name</label>
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
          placeholder="e.g. 0123456789 or +60123456789"
          inputMode="tel"
          autoComplete="tel"
          required
        />
        {phoneError && <p className="mt-2 text-sm text-red-600">{phoneError}</p>}
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
                  ? "border-black bg-black text-white"
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

      <p className="text-sm text-zinc-600">
        Total {guests} = Adults {adults} + Kids {kids}
      </p>

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
        disabled={submitting}
        className={[
          "w-full rounded-2xl p-3.5 text-white transition",
          submitting ? "bg-black/70" : "bg-black hover:opacity-90",
        ].join(" ")}
      >
        {submitting ? "Submitting..." : "Submit RSVP"}
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