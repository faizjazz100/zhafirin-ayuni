"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type Result = {
  full_name: string | null;
  session: string | null;
  guests: number | null;
};

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "found"; data: Result }
  | { status: "not_found" }
  | { status: "error"; message: string };

const SESSION_RANGE: Record<string, string> = {
  "Session 1": "3:00 PM – 4:30 PM",
  "Session 2": "4:30 PM – 5:30 PM",
  "Session 3": "5:30 PM – 8:00 PM",
};

function normalizePhone(input: string) {
  let cleaned = input.trim().replace(/[^\d+]/g, "");
  if (cleaned.includes("+")) cleaned = "+" + cleaned.replace(/\+/g, "");
  if (/^01\d{8,9}$/.test(cleaned)) return `+60${cleaned.slice(1)}`;
  if (/^601\d{8,9}$/.test(cleaned)) return `+${cleaned}`;
  return cleaned;
}

export default function SessionLookup() {
  const [phone, setPhone] = useState("");
  const [state, setState] = useState<State>({ status: "idle" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const normalized = normalizePhone(phone);
    if (!normalized) return;

    setState({ status: "loading" });

    const { data, error } = await supabase
      .from("rsvps")
      .select("full_name, session, guests")
      .eq("phone", normalized)
      .maybeSingle();

    if (error) {
      setState({ status: "error", message: "Something went wrong. Please try again." });
      return;
    }

    if (!data) {
      setState({ status: "not_found" });
      return;
    }

    setState({ status: "found", data: data as Result });
  }

  function reset() {
    setPhone("");
    setState({ status: "idle" });
  }

  return (
    <div>
      <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.4em] text-[#7A0022]/70">
        Session Lookup
      </p>

      {state.status !== "found" && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="phone" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => { setPhone(e.target.value); setState({ status: "idle" }); }}
              placeholder="e.g. 0123456789"
              className="w-full rounded-2xl border border-black/10 bg-[#FDFCFB] px-4 py-3.5 text-base text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-[#7A0022]/40 focus:ring-2 focus:ring-[#7A0022]/10"
              autoComplete="tel"
              required
            />
            <p className="mt-1.5 text-[11px] text-zinc-400">
              Use the same number you submitted in your RSVP.
            </p>
          </div>

          {state.status === "not_found" && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3.5">
              <p className="text-sm font-semibold text-amber-800">No RSVP found</p>
              <p className="mt-0.5 text-[13px] text-amber-700">
                We couldn&apos;t find an RSVP for this number. Try a different format, or{" "}
                <a href="/contact" className="underline underline-offset-2">contact us</a>.
              </p>
            </div>
          )}

          {state.status === "error" && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5">
              <p className="text-sm font-semibold text-red-800">Error</p>
              <p className="mt-0.5 text-[13px] text-red-700">{state.message}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={state.status === "loading" || !phone.trim()}
            className="inline-flex items-center justify-center rounded-full bg-[#7A0022] px-8 py-3.5 text-[11px] font-semibold tracking-[0.3em] text-white shadow-[0_8px_24px_rgba(122,0,34,0.25)] transition hover:bg-[#64001C] disabled:opacity-50"
          >
            {state.status === "loading" ? "Searching…" : "CHECK MY SESSION"}
          </button>
        </form>
      )}

      {state.status === "found" && (
        <div className="flex flex-col gap-4">
          {/* Result card */}
          <div className="overflow-hidden rounded-[28px] border border-[#7A0022]/15 bg-gradient-to-b from-[#7A0022] to-[#5a0019] p-6 text-white shadow-[0_16px_48px_rgba(122,0,34,0.28)]">
            <p className="text-[9px] font-semibold uppercase tracking-[0.5em] text-white/60">
              Your Session
            </p>
            <p className="mt-2 text-4xl font-bold tracking-tight">
              {state.data.session ?? "—"}
            </p>
            <p className="mt-1 text-xl font-semibold text-white/80">
              {state.data.session ? SESSION_RANGE[state.data.session] : ""}
            </p>

            <div className="mt-5 h-px w-full bg-white/15" />

            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/50">Name</p>
                <p className="mt-0.5 text-sm font-semibold text-white">
                  {state.data.full_name ?? "—"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/50">Guests</p>
                <p className="mt-0.5 text-sm font-semibold text-white">
                  {state.data.guests ?? "—"} pax
                </p>
              </div>
            </div>
          </div>

          <p className="text-center text-[12px] text-zinc-400">
            Please arrive on time. We look forward to seeing you!
          </p>

          <button
            type="button"
            onClick={reset}
            className="mx-auto inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.3em] text-zinc-400 hover:text-zinc-600"
          >
            ← Look up another number
          </button>
        </div>
      )}
    </div>
  );
}
