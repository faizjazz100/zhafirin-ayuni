"use client";

import Link from "next/link";
import { useEffect, useMemo, useCallback, useState } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

type NavItem =
    | { label: string; href: string; kind?: "link" }
    | { label: string; href: `#${string}`; kind: "anchor" };

function MenuIcon({ open }: { open: boolean }) {
    return (
        <div className="relative h-4 w-5">
            <span className={[
                "absolute left-0 h-0.5 w-full rounded-full bg-current transition-all duration-300 origin-center",
                open ? "top-[7px] rotate-45" : "top-0",
            ].join(" ")} />
            <span className={[
                "absolute left-0 top-[7px] h-0.5 w-full rounded-full bg-current transition-all duration-300",
                open ? "opacity-0 scale-x-50" : "opacity-100",
            ].join(" ")} />
            <span className={[
                "absolute left-0 h-0.5 w-full rounded-full bg-current transition-all duration-300 origin-center",
                open ? "top-[7px] -rotate-45" : "top-[14px]",
            ].join(" ")} />
        </div>
    );
}

export default function Navbar({
    monogram = "A TO Z",
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
                { label: "HOME", href: "/", kind: "link" },
                { label: "OUR STORY", href: "/our-story", kind: "link" },
                { label: "SCHEDULE", href: "/schedule", kind: "link" },
                { label: "VENUE", href: "/venue", kind: "link" },
                { label: "CONTACT", href: "/contact", kind: "link" },
            ],
        [items]
    );

    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            setUser(data.session?.user ?? null);
        });
        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });
        return () => listener.subscription.unsubscribe();
    }, []);

    const isAdmin = !!user;

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, []);

    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = prev; };
    }, [open]);

    const close = useCallback(() => setOpen(false), []);

    const Anchor = ({ href, label }: { href: `#${string}`; label: string }) => (
        <button
            className="w-full py-3.5 text-left text-[11px] font-semibold tracking-[0.18em] text-zinc-700 transition hover:text-[#7A0022]"
            onClick={() => {
                close();
                setTimeout(() => {
                    const el = document.getElementById(href.slice(1));
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
            <header className={[
                "sticky top-0 z-[2001] transition-shadow duration-300",
                scrolled ? "shadow-[0_2px_24px_rgba(0,0,0,0.09)]" : "",
            ].join(" ")}>
                <div className="border-b border-black/6 bg-white/96 backdrop-blur-md">
                    <div className="mx-auto max-w-5xl px-5 sm:px-6">
                        <div className="relative flex items-center justify-center py-4">

                            {/* Hamburger — mobile only */}
                            <button
                                aria-label={open ? "Close menu" : "Open menu"}
                                aria-expanded={open}
                                className="absolute left-0 inline-flex h-11 w-11 items-center justify-center text-zinc-700 transition hover:text-zinc-900 lg:hidden"
                                onClick={() => setOpen((v) => !v)}
                            >
                                <MenuIcon open={open} />
                            </button>

                            {/* Desktop nav */}
                            <nav className="absolute left-0 hidden items-center gap-6 lg:flex">
                                {navItems.map((it) => {
                                    if ("kind" in it && it.kind === "anchor") {
                                        return (
                                            <button
                                                key={it.label}
                                                className="text-[11px] font-semibold tracking-[0.18em] text-zinc-500 transition hover:text-[#7A0022]"
                                                onClick={() => {
                                                    const el = document.getElementById(it.href.slice(1));
                                                    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                                                    history.replaceState(null, "", it.href);
                                                }}
                                            >
                                                {it.label}
                                            </button>
                                        );
                                    }
                                    const isActive = pathname === it.href;
                                    return (
                                        <Link
                                            key={it.label}
                                            href={it.href}
                                            aria-current={isActive ? "page" : undefined}
                                            className={[
                                                "relative text-[11px] font-semibold tracking-[0.18em] transition hover:text-[#7A0022]",
                                                isActive ? "text-[#7A0022]" : "text-zinc-500",
                                            ].join(" ")}
                                        >
                                            {it.label}
                                            {isActive && (
                                                <span className="absolute -bottom-[18px] left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-[#7A0022]" />
                                            )}
                                        </Link>
                                    );
                                })}
                            </nav>

                            {/* Monogram */}
                            <Link
                                href="/"
                                className="font-serif text-[15px] font-semibold tracking-[0.22em] text-[#7A0022] transition hover:text-zinc-800"
                            >
                                {monogram}
                            </Link>

                            {/* Right actions */}
                            <div className="absolute right-0 flex items-center gap-3">
                                {/* <Link
                                    href={rsvpHref}
                                    className="inline-flex items-center justify-center rounded-full bg-[#7A0022] px-4 py-1.5 text-[10px] font-semibold tracking-[0.26em] text-white shadow-[0_4px_14px_rgba(122,0,34,0.25)] transition hover:bg-[#64001C]"
                                >
                                    RSVP
                                </Link>*/}
                                {isAdmin && (
                                    <Link
                                        href="/admin"
                                        className="hidden text-[11px] font-semibold tracking-[0.22em] text-zinc-400 transition hover:text-[#7A0022] sm:block"
                                    >
                                        Admin
                                    </Link>
                                )}
                            </div>

                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile drawer overlay */}
            <div
                className={[
                    "fixed inset-0 z-[2000] transition-opacity duration-300",
                    open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
                ].join(" ")}
                aria-hidden={!open}
            >
                <div className="absolute inset-0 bg-black/40" onClick={close} />

                <aside
                    role="dialog"
                    aria-modal="true"
                    aria-label="Navigation menu"
                    className={[
                        "absolute left-0 top-0 flex h-full w-[82%] max-w-[320px] flex-col bg-white shadow-[4px_0_40px_rgba(0,0,0,0.12)] transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
                        open ? "translate-x-0" : "-translate-x-full",
                    ].join(" ")}
                >
                    {/* Drawer header */}
                    <div className="flex items-center justify-between px-6 py-5">
                        <span className="font-serif text-[13px] font-semibold tracking-[0.24em] text-[#7A0022]">
                            {monogram}
                        </span>
                        <button
                            onClick={close}
                            aria-label="Close menu"
                            className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
                        >
                            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="mx-6 h-px bg-black/6" />

                    {/* Nav links */}
                    <nav className="flex-1 overflow-y-auto px-4 py-3">
                        {navItems.map((it) => {
                            if ("kind" in it && it.kind === "anchor") {
                                return <Anchor key={it.label} href={it.href} label={it.label} />;
                            }
                            const isActive = pathname === it.href;
                            return (
                                <Link
                                    key={it.label}
                                    href={it.href}
                                    onClick={close}
                                    aria-current={isActive ? "page" : undefined}
                                    className={[
                                        "flex items-center gap-3 rounded-xl px-3 py-3.5 text-[11px] font-semibold tracking-[0.18em] transition",
                                        isActive
                                            ? "bg-[#7A0022]/6 text-[#7A0022]"
                                            : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900",
                                    ].join(" ")}
                                >
                                    {isActive && <span className="h-3.5 w-0.5 rounded-full bg-[#7A0022]" />}
                                    {it.label}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="mx-6 h-px bg-black/6" />

                    {/* Drawer footer */}
                    <div className="px-6 py-6 space-y-3">
                        <Link
                            href={rsvpHref}
                            onClick={close}
                            className="block w-full rounded-full bg-[#7A0022] py-3 text-center text-[10px] font-semibold tracking-[0.35em] text-white shadow-[0_8px_24px_rgba(122,0,34,0.22)] transition hover:bg-[#64001C]"
                        >
                            RSVP
                        </Link>
                        {isAdmin && (
                            <Link
                                href="/admin"
                                onClick={close}
                                className="block w-full rounded-full border border-black/10 py-3 text-center text-[10px] font-semibold tracking-[0.3em] text-zinc-500 transition hover:border-[#7A0022]/30 hover:text-[#7A0022]"
                            >
                                ADMIN
                            </Link>
                        )}
                        <p className="pt-2 text-center text-[9px] tracking-[0.35em] text-zinc-300">#ZHAFYUNI</p>
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
