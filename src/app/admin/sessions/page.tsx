"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useCallback } from "react";

type SessionName = "Session 1" | "Session 2" | "Session 3";

type SessionLimitRow = {
    id: number;
    session_name: SessionName;
    guest_limit: number;
    created_at?: string;
};

type RsvpAgg = {
    session: SessionName | null;
    guests: number | null;
};

export default function AdminSessionsPage() {
    const [rows, setRows] = useState<SessionLimitRow[]>([]);
    const [rsvpRows, setRsvpRows] = useState<RsvpAgg[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<Record<string, boolean>>({});
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");



    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        setSuccess("");

        const [{ data: limits, error: limitsError }, { data: rsvps, error: rsvpsError }] =
            await Promise.all([
                supabase
                    .from("session_limits")
                    .select("id, session_name, guest_limit, created_at")
                    .order("session_name", { ascending: true }),

                supabase
                    .from("rsvps")
                    .select("session, guests"),
            ]);

        if (limitsError) {
            setError(limitsError.message);
            setRows([]);
            setLoading(false);
            return;
        }

        if (rsvpsError) {
            setError(rsvpsError.message);
            setRsvpRows([]);
            setRows((limits ?? []) as SessionLimitRow[]);
            setLoading(false);
            return;
        }

        setRows((limits ?? []) as SessionLimitRow[]);
        setRsvpRows((rsvps ?? []) as RsvpAgg[]);
        setLoading(false);
    }, []);

    const usageMap = useMemo(() => {
        const map: Record<string, number> = {
            "Session 1": 0,
            "Session 2": 0,
            "Session 3": 0,
        };

        for (const row of rsvpRows) {
            if (!row.session) continue;
            map[row.session] = (map[row.session] ?? 0) + (Number(row.guests) || 0);
        }

        return map;
    }, [rsvpRows]);

    function updateLocalLimit(sessionName: SessionName, value: number) {
        setRows((prev) =>
            prev.map((row) =>
                row.session_name === sessionName
                    ? { ...row, guest_limit: Math.max(0, value) }
                    : row
            )
        );
    }

    async function saveRow(row: SessionLimitRow) {
        setSaving((prev) => ({ ...prev, [row.session_name]: true }));
        setError("");
        setSuccess("");

        const { error } = await supabase
            .from("session_limits")
            .update({ guest_limit: Math.max(0, Number(row.guest_limit) || 0) })
            .eq("id", row.id);

        if (error) {
            setError(`Failed to save ${row.session_name}: ${error.message}`);
        } else {
            setSuccess(`${row.session_name} updated successfully.`);
            await load();
        }

        setSaving((prev) => {
            const copy = { ...prev };
            delete copy[row.session_name];
            return copy;
        });
    }

    return (
        <main className="min-h-screen bg-[#FBF7F2] text-zinc-800">
            <div className="pointer-events-none fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-[radial-gradient(1200px_800px_at_10%_10%,rgba(122,0,34,0.08),transparent_60%),radial-gradient(900px_700px_at_90%_20%,rgba(0,0,0,0.05),transparent_55%)]" />
                <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-[#FBF7F2]/55 to-white/80" />
            </div>

            <div className="mx-auto max-w-5xl px-5 pb-14 pt-10 sm:px-6 sm:pt-14">
                <div className="rounded-[28px] border border-white/55 bg-white/65 p-6 shadow-[0_20px_70px_rgba(0,0,0,0.10)] sm:p-10">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[#7A0022]/80">
                                Admin
                            </p>
                            <h1 className="mt-2 font-serif text-3xl font-semibold text-zinc-900 sm:text-4xl">
                                Session Limits
                            </h1>
                            <p className="mt-2 text-sm text-zinc-600">
                                Manage the maximum number of guests allowed in each session.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
                            <Link
                                href="/admin"
                                className="inline-flex items-center justify-center rounded-full bg-[#7A0022] px-5 py-3 text-sm font-medium text-white shadow-sm hover:bg-[#64001C] transition"
                            >
                                Back to RSVP Dashboard
                            </Link>

                            <button
                                onClick={load}
                                className="rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm hover:bg-zinc-50"
                            >
                                Refresh
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                            {success}
                        </div>
                    )}

                    <div className="mt-6 grid gap-4 md:grid-cols-3">
                        {loading ? (
                            <div className="rounded-3xl border border-black/10 bg-white/80 p-6 text-sm text-zinc-600">
                                Loading sessions...
                            </div>
                        ) : (
                            rows.map((row) => {
                                const used = usageMap[row.session_name] ?? 0;
                                const remaining = Math.max(0, row.guest_limit - used);
                                const isSaving = !!saving[row.session_name];

                                return (
                                    <div
                                        key={row.id}
                                        className="rounded-3xl border border-black/10 bg-white/80 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.06)]"
                                    >
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.30em] text-zinc-500">
                                            {row.session_name}
                                        </p>

                                        <div className="mt-4 space-y-3">
                                            <Info label="Current RSVP guests" value={used} />
                                            <Info label="Remaining slots" value={remaining} />
                                        </div>

                                        <div className="mt-5">
                                            <label className="block text-sm text-zinc-600">
                                                Guest limit
                                            </label>
                                            <input
                                                type="number"
                                                min={0}
                                                value={row.guest_limit}
                                                onChange={(e) =>
                                                    updateLocalLimit(
                                                        row.session_name,
                                                        Number(e.target.value || 0)
                                                    )
                                                }
                                                className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-zinc-400"
                                            />
                                        </div>

                                        <button
                                            onClick={() => saveRow(row)}
                                            disabled={isSaving}
                                            className="mt-5 w-full rounded-2xl bg-[#7A0022] px-4 py-3 text-sm font-medium text-white hover:bg-[#64001C] disabled:opacity-50"
                                        >
                                            {isSaving ? "Saving..." : `Save ${row.session_name}`}
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}

function Info({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-2xl bg-zinc-50 px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.24em] text-zinc-500">
                {label}
            </p>
            <p className="mt-1 text-lg font-semibold text-zinc-900">{value}</p>
        </div>
    );
}