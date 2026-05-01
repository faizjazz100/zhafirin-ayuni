"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import FloralBackground from "@/src/app/components/FloralBackground";
import { supabase } from "@/lib/supabase";

type ContactItem = {
    name: string;
    phoneDisplay: string;
    phoneE164: string;
};

const FALLBACK_CONTACTS: ContactItem[] = [
    { name: "Mai (Groom's)",      phoneDisplay: "013-355 2455", phoneE164: "60133552455" },
    { name: "Elin (Groom's)",     phoneDisplay: "019-226 6996", phoneE164: "60192266996" },
    { name: "Darwish (Bride's)",  phoneDisplay: "012-846 2690", phoneE164: "60128462690" },
    { name: "En Firdaus (Bride's)", phoneDisplay: "019-282 7625", phoneE164: "60192827625" },
];

export default function ContactPage() {
    const COUPLE = "Zhafirin & Ayuni";
    const [contacts, setContacts] = useState<ContactItem[]>(FALLBACK_CONTACTS);

    useEffect(() => {
        supabase
            .from("contacts")
            .select("name, phone_display, phone_e164")
            .order("display_order", { ascending: true })
            .then(({ data }) => {
                if (data && data.length > 0) {
                    setContacts(
                        data.map((r) => ({
                            name: r.name,
                            phoneDisplay: r.phone_display,
                            phoneE164: r.phone_e164,
                        }))
                    );
                }
            });
    }, []);

    return (
        <main className="min-h-screen text-zinc-800 selection:bg-[#7A0022]/15">
            <FloralBackground />

            {/* Background */}
            <div className="pointer-events-none fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-[radial-gradient(1200px_800px_at_10%_10%,rgba(122,0,34,0.08),transparent_60%),radial-gradient(900px_700px_at_90%_20%,rgba(176,16,62,0.07),transparent_55%)]" />
                <div className="absolute inset-0 bg-linear-to-b from-[#FBF7F2] via-[#FBF7F2] to-white" />
            </div>

            <div className="mx-auto max-w-2xl px-5 pb-20 pt-16 sm:px-6 sm:pt-24">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, ease: "easeOut" }}
                    className="mb-10 text-center"
                >
                    <p className="text-[10px] font-semibold uppercase tracking-[0.52em] text-[#7A0022]/70">
                        Contact
                    </p>
                    <h1 className="mt-2 font-serif text-4xl font-semibold text-zinc-900 sm:text-5xl">
                        Get in Touch
                    </h1>
                    <div className="mx-auto mt-3 flex items-center justify-center gap-3">
                        <div className="h-px w-10 bg-[#7A0022]/15" />
                        <div className="h-1 w-1 rotate-45 bg-[#7A0022]/30" />
                        <div className="h-px w-10 bg-[#7A0022]/15" />
                    </div>
                    <p className="mt-3 text-sm text-zinc-500">
                        If you have any questions about the event, location, or RSVP, feel free to contact us.
                    </p>
                </motion.div>

                {/* Contact cards */}
                <div className="grid gap-4 sm:grid-cols-2">
                    {contacts.map((c, i) => (
                        <motion.div
                            key={c.name}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.45, delay: 0.1 + i * 0.07, ease: "easeOut" }}
                            className="overflow-hidden rounded-3xl border border-white/60 bg-white px-6 py-6 shadow-[0_16px_48px_rgba(0,0,0,0.09),0_0_0_1px_rgba(122,0,34,0.05)]"
                        >
                            <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-[#7A0022]/65">
                                {c.name}
                            </p>
                            <p className="mt-2 text-xl font-semibold text-zinc-900">
                                {c.phoneDisplay}
                            </p>

                            <div className="mt-5 flex gap-2.5">
                                <a
                                    href={`tel:+${c.phoneE164}`}
                                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[#7A0022] py-2.5 text-sm font-medium text-white shadow-[0_6px_18px_rgba(122,0,34,0.22)] transition hover:bg-[#64001C]"
                                >
                                    <PhoneIcon />
                                    Call
                                </a>
                                <a
                                    href={`https://wa.me/${c.phoneE164}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-black/10 bg-white/90 py-2.5 text-sm font-medium text-zinc-800 transition hover:bg-white"
                                >
                                    <WhatsAppIcon />
                                    WhatsApp
                                </a>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* FAQ */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="mt-6 overflow-hidden rounded-3xl border border-white/60 bg-white px-7 py-6 shadow-[0_16px_48px_rgba(0,0,0,0.09),0_0_0_1px_rgba(122,0,34,0.05)] sm:px-8"
                >
                    <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-[#7A0022]/70">
                        Common Questions
                    </p>
                    <ul className="mt-4 space-y-3">
                        <li className="flex items-start gap-3 text-sm text-zinc-600">
                            <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#7A0022]/40" />
                            For directions / parking, check the Venue section on the Home page.
                        </li>
                    </ul>
                </motion.div>

                {/* Actions */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center"
                >
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white/85 px-6 py-3 text-sm font-medium text-zinc-900 backdrop-blur transition hover:bg-white"
                    >
                        ← Back to Home
                    </Link>
                </motion.div>

                <p className="mt-8 text-center text-xs text-zinc-400">
                    © {new Date().getFullYear()} {COUPLE}
                </p>

            </div>
        </main>
    );
}

function PhoneIcon() {
    return (
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.01 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z" />
        </svg>
    );
}

function WhatsAppIcon() {
    return (
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
    );
}
