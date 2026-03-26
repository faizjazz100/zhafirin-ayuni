"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type NavItem =
    | { label: string; href: string; kind?: "link" }
    | { label: string; href: `#${string}`; kind: "anchor" };

export default function Navbar({
    monogram = "A & Z",
    rsvpHref = "/rsvp",
    items,
}: {
    monogram?: string;
    rsvpHref?: string;
    items?: NavItem[];
}) {
    const navItems = useMemo<NavItem[]>(
        () =>
            items ?? [
                { label: "Home", href: "/", kind: "link" },
                { label: "Our Story", href: "/our-story", kind: "link" },
                { label: "Schedule", href: "/schedule", kind: "link" },
                { label: "Venue", href: "/venue", kind: "link" },
                { label: "Contact", href: "/contact", kind: "link" },
            ],
        [items]
    );

    const [open, setOpen] = useState(false);

    const close = () => setOpen(false);

    // Escape closes menu
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, []);

    // Prevent body scroll when open
    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = prev;
        };
    }, [open]);

    const Anchor = ({ href, label }: { href: `#${string}`; label: string }) => (
        <button
            className="w-full py-3 text-left text-sm font-medium text-zinc-900 hover:text-[#7A0022] transition"
            onClick={() => {
                close();
                setTimeout(() => {
                    const id = href.slice(1);
                    const el = document.getElementById(id);
                    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                    history.replaceState(null, "", href);
                }, 40);
            }}
        >
            {label}
        </button>
    );

    return (
        <>
            {/* Header: no box */}
            <header className="sticky top-0 z-50">
                {/* subtle fade so text stays readable without a “bar” */}
                <div className="bg-[#FBF7F2]/55 backdrop-blur-md">
                    <div className="mx-auto max-w-5xl px-5 sm:px-6">
                        <div className="relative flex items-center justify-center py-4">
                            {/* Left: hamburger (no box) */}
                            <button
                                aria-label={open ? "Close menu" : "Open menu"}
                                className="absolute left-0 inline-flex h-10 w-10 items-center justify-center text-zinc-700 hover:text-zinc-900 transition"
                                onClick={() => setOpen((v) => !v)}
                            >
                                <Hamburger />
                            </button>

                            {/* Center: monogram clickable */}
                            <Link
                                href="/"
                                className="font-serif text-[15px] tracking-[0.22em] text-zinc-700 hover:text-zinc-900 transition"
                            >
                                {monogram}
                            </Link>

                            {/* Right: RSVP as text link (no button box) */}
                            <Link
                                href={rsvpHref}
                                className="absolute right-0 hidden sm:inline-flex text-xs font-semibold tracking-[0.30em] text-[#7A0022] hover:text-[#64001C] transition"
                            >
                                RSVP
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Overlay */}
            <div
                className={`fixed inset-0 z-40 transition ${open ? "pointer-events-auto" : "pointer-events-none"
                    }`}
                aria-hidden={!open}
            >
                {/* backdrop */}
                <div
                    className={`absolute inset-0 bg-black/40 transition-opacity ${open ? "opacity-100" : "opacity-0"
                        }`}
                    onClick={close}
                />

                {/* Drawer */}
                <aside
                    role="dialog"
                    aria-modal="true"
                    aria-label="Menu"
                    className={`absolute left-0 top-0 h-full w-[86%] max-w-sm bg-[#FBF7F2] shadow-2xl transition-transform duration-200 ${open ? "translate-x-0" : "-translate-x-full"
                        }`}
                >
                    <div className="px-6 py-6">
                        <div className="flex items-center justify-between">
                            <div className="font-serif text-[13px] tracking-[0.24em] text-zinc-700">
                                {monogram}
                            </div>

                            {/* optional: keep this tiny close text, not an X box */}
                            <button
                                className="text-xs font-semibold tracking-[0.30em] text-zinc-500 hover:text-zinc-900 transition"
                                onClick={close}
                            >
                                CLOSE
                            </button>
                        </div>

                        <div className="mt-6 h-px w-full bg-black/10" />

                        <nav className="mt-4">
                            <div className="space-y-1">
                                {navItems.map((it) => {
                                    if ("kind" in it && it.kind === "anchor") {
                                        return <Anchor key={it.label} href={it.href} label={it.label} />;
                                    }
                                    return (
                                        <Link
                                            key={it.label}
                                            href={it.href}
                                            onClick={close}
                                            className="block py-3 text-sm font-medium text-zinc-900 hover:text-[#7A0022] transition"
                                        >
                                            {it.label}
                                        </Link>
                                    );
                                })}
                            </div>

                            <div className="mt-6 h-px w-full bg-black/10" />

                            {/* Actions (still no boxes; just clean links) */}
                            <div className="mt-4 space-y-3">
                                <Link
                                    href={rsvpHref}
                                    onClick={close}
                                    className="block text-sm font-semibold tracking-[0.22em] text-[#7A0022] hover:text-[#64001C] transition"
                                >
                                    RSVP →
                                </Link>
                            </div>
                        </nav>
                    </div>
                </aside>
            </div>

            <style jsx global>{`
        .font-serif {
          font-family: var(--font-serif), ui-serif, Georgia, serif;
        }
      `}</style>
        </>
    );
}

function Hamburger() {
    return (
        <div className="grid gap-1.5">
            <div className="h-0.5 w-6 rounded bg-current" />
            <div className="h-0.5 w-6 rounded bg-current" />
            <div className="h-0.5 w-6 rounded bg-current" />
        </div>
    );
}