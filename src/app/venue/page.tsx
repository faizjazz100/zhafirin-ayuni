"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import PageContainer from "@/src/app/components/PageContainer";
import Image from "next/image";
import { useState } from "react";

export default function VenuePage() {
    const COUPLE = "Zhafirin & Ayuni";

    const VENUE_NAME = "Hacienda A-Park";
    const ADDRESS_LINE_1 = "3275, Jalan Pulau Meranti, Kampung Pulau Meranti,";
    const ADDRESS_LINE_2 = "47100 Puchong, Selangor";
    const MAP_EMBED_URL = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3984.4791408285764!2d101.62914477584432!3d2.964468054258369!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31cdb53c383b30c7%3A0xc83f51b692ba17bd!2sThe%20Hub%20%40%20A-Park!5e0!3m2!1sen!2smy!4v1774507979068!5m2!1sen!2smy";
    const GOOGLE_MAPS_URL = "https://maps.app.goo.gl/SfCJExkyFnWcZZ2J9";
    const WAZE_URL = "https://waze.com/ul/hw282bew6e&navigate=yes";

    return (
        <main className="min-h-screen bg-[#FBF7F2] text-zinc-800">
            <PageContainer floral>
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                    className="rounded-[28px] border border-white/55 bg-white/65 p-6 shadow-[0_20px_70px_rgba(0,0,0,0.10)] sm:p-10"
                >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[#7A0022]/80">
                        Location
                    </p>

                    <h1 className="mt-2 font-serif text-4xl font-semibold text-zinc-900 sm:text-5xl">
                        Venue & Directions
                    </h1>

                    <p className="mt-3 text-sm text-zinc-600">
                        Use Google Maps or Waze for the easiest navigation.
                    </p>

                    {/* Venue card */}
                    <div className="mt-8 rounded-[28px] border border-black/10 bg-white/75 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
                        <p className="text-xs font-semibold uppercase tracking-[0.30em] text-[#7A0022]/80">
                            Venue
                        </p>

                        <p className="mt-2 text-lg font-semibold text-zinc-900">
                            {VENUE_NAME}
                        </p>

                        <p className="mt-2 text-[15px] leading-7 text-zinc-700">
                            {ADDRESS_LINE_1}
                            <br />
                            {ADDRESS_LINE_2}
                        </p>

                        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                            <a
                                href={GOOGLE_MAPS_URL}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white/85 px-6 py-3 text-sm font-medium text-zinc-900 backdrop-blur hover:bg-white"
                            >
                                Open in Google Maps
                            </a>

                            <a
                                href={WAZE_URL}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center justify-center rounded-full bg-[#7A0022] px-6 py-3 text-sm font-medium text-white shadow-[0_12px_26px_rgba(122,0,34,0.18)] hover:bg-[#64001C]"
                            >
                                Open in Waze
                            </a>
                        </div>
                    </div>

                    <VenueMapLightbox />

                    {/* Map embed */}
                    <div className="mt-6 overflow-hidden rounded-[28px] border border-black/10 bg-white/80 shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
                        <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
                            <iframe
                                title="Venue map"
                                src={MAP_EMBED_URL}
                                className="absolute inset-0 h-full w-full"
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                allowFullScreen
                            />
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="mt-6 rounded-[28px] border border-black/10 bg-white/75 p-6">
                        <p className="text-sm font-semibold text-zinc-900">Notes</p>
                        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-zinc-700">
                            <li>Please arrive early for parking.</li>
                            <li>Follow signage at the venue entrance.</li>
                            <li>If you get lost, contact us from the Contact page.</li>
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

function VenueMapLightbox() {
    const [open, setOpen] = useState(false);

    return (
        <>
            {/* Clickable thumbnail */}
            <div
                className="mt-6 overflow-hidden rounded-[28px] border border-black/10 bg-white/80 shadow-[0_10px_30px_rgba(0,0,0,0.06)] cursor-zoom-in"
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

            {/* Lightbox overlay */}
            {open && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    onClick={() => setOpen(false)}
                >
                    <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => setOpen(false)}
                            className="absolute -top-4 -right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white text-zinc-900 shadow-lg text-lg font-bold"
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