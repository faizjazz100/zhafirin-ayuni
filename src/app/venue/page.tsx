"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import FloralBackground from "@/src/app/components/FloralBackground";
import Image from "next/image";
import { useState } from "react";
import { DirectionAnimation } from "@/src/app/components/DirectionAnimation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWaze, faGoogle } from "@fortawesome/free-brands-svg-icons";

const COUPLE        = "Zhafirin & Ayuni";
const VENUE_NAME    = "Hacienda A-Park";
const ADDRESS_LINE_1 = "3275, Jalan Pulau Meranti, Kampung Pulau Meranti,";
const ADDRESS_LINE_2 = "47100 Puchong, Selangor";
const MAP_EMBED_URL = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3984.4791408285764!2d101.62914477584432!3d2.964468054258369!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31cdb53c383b30c7%3A0xc83f51b692ba17bd!2sThe%20Hub%20%40%20A-Park!5e0!3m2!1sen!2smy!4v1774507979068!5m2!1sen!2smy";
const GOOGLE_MAPS_URL = "https://maps.app.goo.gl/SfCJExkyFnWcZZ2J9";
const WAZE_URL      = "https://waze.com/ul/hw282bew6e&navigate=yes";

export default function VenuePage() {
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
                        Location
                    </p>
                    <h1 className="mt-2 font-serif text-4xl font-semibold text-zinc-900 sm:text-5xl">
                        Venue & Directions
                    </h1>
                    <div className="mx-auto mt-3 flex items-center justify-center gap-3">
                        <div className="h-px w-10 bg-[#7A0022]/15" />
                        <div className="h-1 w-1 rotate-45 bg-[#7A0022]/30" />
                        <div className="h-px w-10 bg-[#7A0022]/15" />
                    </div>
                    <p className="mt-3 text-sm text-zinc-500">
                        Use Google Maps or Waze for the easiest navigation.
                    </p>
                </motion.div>

                {/* Venue info card */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
                    className="overflow-hidden rounded-[28px] border border-white/60 bg-white px-7 py-7 shadow-[0_32px_80px_rgba(0,0,0,0.12),0_0_0_1px_rgba(122,0,34,0.05)] sm:px-10 sm:py-8"
                >
                    <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-[#7A0022]/70">
                        Venue
                    </p>
                    <p className="mt-2 text-xl font-semibold text-zinc-900 sm:text-2xl">
                        {VENUE_NAME}
                    </p>
                    <p className="mt-2 text-[15px] leading-7 text-zinc-600">
                        {ADDRESS_LINE_1}<br />{ADDRESS_LINE_2}
                    </p>

                    <div className="mt-6 flex flex-wrap gap-3">
                        <a
                            href={GOOGLE_MAPS_URL}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/85 px-5 py-2.5 text-sm font-medium text-zinc-900 backdrop-blur transition hover:bg-white"
                        >
                            <FontAwesomeIcon icon={faGoogle} className="h-4 w-4" />
                            Open in Google Maps
                        </a>
                        <a
                            href={WAZE_URL}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded-full bg-[#7A0022] px-5 py-2.5 text-sm font-medium text-white shadow-[0_8px_24px_rgba(122,0,34,0.22)] transition hover:bg-[#64001C]"
                        >
                            <FontAwesomeIcon icon={faWaze} className="h-4 w-4" />
                            Open in Waze
                        </a>
                    </div>
                </motion.div>

                {/* Route Guide */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="mt-6 overflow-hidden rounded-[28px] border border-white/60 bg-white shadow-[0_32px_80px_rgba(0,0,0,0.12),0_0_0_1px_rgba(122,0,34,0.05)]"
                >
                    <div className="px-7 pt-7 sm:px-10 sm:pt-8">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-[#7A0022]/70">
                            Route Guide
                        </p>
                        <p className="mt-1 text-sm text-zinc-500">
                            Animated direction from the main road to the venue.
                        </p>
                    </div>
                    <div className="mt-4 overflow-hidden">
                        <DirectionAnimation plain interactive />
                    </div>
                </motion.div>

                {/* Venue Map */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="mt-6 overflow-hidden rounded-[28px] border border-white/60 bg-white shadow-[0_32px_80px_rgba(0,0,0,0.12),0_0_0_1px_rgba(122,0,34,0.05)]"
                >
                    <div className="px-7 pt-7 sm:px-10 sm:pt-8">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-[#7A0022]/70">
                            Venue Map
                        </p>
                        <p className="mt-1 text-sm text-zinc-500">Tap to enlarge.</p>
                    </div>
                    <div className="mt-4">
                        <VenueMapLightbox />
                    </div>
                </motion.div>

                {/* Google Map embed */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="mt-6 overflow-hidden rounded-[28px] border border-white/60 bg-white shadow-[0_32px_80px_rgba(0,0,0,0.12),0_0_0_1px_rgba(122,0,34,0.05)]"
                >
                    <div className="px-7 pt-7 sm:px-10 sm:pt-8">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-[#7A0022]/70">
                            Google Map
                        </p>
                        <p className="mt-1 text-sm text-zinc-500">Interactive map.</p>
                    </div>
                    <div className="relative mt-4 w-full" style={{ paddingTop: "56.25%" }}>
                        <iframe
                            title="Venue map"
                            src={MAP_EMBED_URL}
                            className="absolute inset-0 h-full w-full"
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            allowFullScreen
                        />
                    </div>
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

function VenueMapLightbox() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <div
                className="cursor-zoom-in overflow-hidden"
                onClick={() => setOpen(true)}
            >
                <Image
                    src="/map.jpeg"
                    alt="Venue map"
                    width={900}
                    height={600}
                    className="w-full object-contain"
                />
            </div>

            {open && (
                <div
                    className="fixed inset-0 z-9999 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
                    onClick={() => setOpen(false)}
                >
                    <div className="relative w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => setOpen(false)}
                            className="absolute -right-4 -top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white text-lg font-bold text-zinc-900 shadow-lg"
                        >
                            ✕
                        </button>
                        <Image
                            src="/map.jpeg"
                            alt="Venue map"
                            width={1800}
                            height={1200}
                            className="w-full rounded-[20px] object-contain"
                        />
                    </div>
                </div>
            )}
        </>
    );
}
