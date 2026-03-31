"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import PageContainer from "@/src/app/components/PageContainer";

export default function ContactPage() {
    const COUPLE = "Zhafirin & Ayuni";

    const CONTACTS = [
        { name: "Darwish (Bride’s)", phoneDisplay: "012-846 2690", phoneE164: "60128462690" },
        { name: "En Firdaus (Bride’s)", phoneDisplay: "019-282 7625", phoneE164: "60192827625" },
        { name: "Mai (Groom’s)", phoneDisplay: "013-355 2455", phoneE164: "60133552455" },
        { name: "Elin (Groom’s)", phoneDisplay: "019-226 6996", phoneE164: "60192266996" },
    ];

    return (
        <main className="min-h-screen bg-[#FBF7F2] text-zinc-800">
            {/* Soft background (matches home) */}
            <div className="pointer-events-none fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-[radial-gradient(1200px_800px_at_10%_10%,rgba(122,0,34,0.10),transparent_60%),radial-gradient(900px_700px_at_90%_20%,rgba(176,16,62,0.08),transparent_55%),radial-gradient(900px_700px_at_50%_100%,rgba(0,0,0,0.06),transparent_60%)]" />
                <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-[#FBF7F2]/55 to-white/80" />
            </div>

            <PageContainer floral>
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                    className="rounded-[28px] border border-white/55 bg-white/65 p-6 shadow-[0_20px_70px_rgba(0,0,0,0.10)] sm:p-10"
                >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[#7A0022]/80">
                        Contact
                    </p>

                    <h1 className="mt-2 font-serif text-4xl font-semibold text-zinc-900 sm:text-5xl">
                        Get in Touch
                    </h1>

                    <p className="mt-3 text-sm text-zinc-600">
                        If you have any questions about the event, location, or RSVP, feel free to contact us.
                    </p>

                    {/* Contact cards */}
                    <div className="mt-8 grid gap-4 sm:grid-cols-2">
                        {CONTACTS.map((c) => (
                            <div
                                key={c.name}
                                className="rounded-3xl border border-black/10 bg-white/75 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.06)]"
                            >
                                <p className="text-xs font-semibold uppercase tracking-[0.30em] text-[#7A0022]/80">
                                    {c.name}
                                </p>

                                <p className="mt-2 text-lg font-semibold text-zinc-900">
                                    {c.phoneDisplay}
                                </p>

                                <div className="mt-4 flex gap-3">
                                    <a
                                        href={`tel:+${c.phoneE164}`}
                                        className="inline-flex flex-1 items-center justify-center rounded-2xl bg-black px-4 py-2 text-sm text-white hover:opacity-90"
                                    >
                                        Call
                                    </a>

                                    <a
                                        href={`https://wa.me/${c.phoneE164}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex flex-1 items-center justify-center rounded-2xl border border-black/10 bg-white/90 px-4 py-2 text-sm text-zinc-900 hover:bg-white"
                                    >
                                        WhatsApp
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* FAQ box */}
                    <div className="mt-8 rounded-[28px] border border-black/10 bg-white/75 p-6">
                        <p className="text-sm font-semibold text-zinc-900">Common questions</p>
                        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-zinc-700">
                            <li>If you can’t attend, please still RSVP so we can update the list.</li>
                            <li>For directions / parking, check the Venue section on the Home page.</li>
                            <li>If you received a private invite link, please use that link to RSVP.</li>
                        </ul>
                    </div>

                    {/* Actions */}
                    <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                        <Link
                            href="/"
                            className="inline-flex items-center justify-center rounded-2xl border border-black/10 bg-white/85 px-5 py-3 text-sm text-zinc-900 hover:bg-white"
                        >
                            Back to Home
                        </Link>

                        <Link
                            href="/rsvp"
                            className="inline-flex items-center justify-center rounded-2xl bg-[#7A0022] px-5 py-3 text-sm font-medium text-white shadow-[0_12px_26px_rgba(122,0,34,0.18)] hover:bg-[#64001C]"
                        >
                            RSVP
                        </Link>
                    </div>

                    <p className="mt-10 text-center text-sm text-zinc-600">
                        © {new Date().getFullYear()} {COUPLE}
                    </p>
                </motion.div>
            </PageContainer>
        </main>
    );
}