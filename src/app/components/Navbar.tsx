"use client";

import Link from "next/link";
import { useEffect, useMemo, useSyncExternalStore, useCallback, useState } from "react";
import { useSearchParams } from "next/navigation";

type NavItem =
    | { label: string; href: string; kind?: "link" }
    | { label: string; href: `#${string}`; kind: "anchor" };

function subscribe(callback: () => void) {
    window.addEventListener("storage", callback);
    return () => window.removeEventListener("storage", callback);
}

function getAdminSnapshot() {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("showAdminButton") === "true";
}

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

    const searchParams = useSearchParams();
    const [open, setOpen] = useState(false);

    const hasAdminInUrl = searchParams.has("admin");

    const savedAdmin = useSyncExternalStore(
        subscribe,
        getAdminSnapshot,
        () => false
    );

    const showAdminButton = hasAdminInUrl || savedAdmin;

    useEffect(() => {
        const isAdmin = searchParams.has("admin");
        const isPublic = searchParams.has("public");

        if (isAdmin) {
            localStorage.setItem("showAdminButton", "true");
            window.dispatchEvent(new Event("storage"));
        }

        if (isPublic) {
            localStorage.removeItem("showAdminButton");
            window.dispatchEvent(new Event("storage"));
            window.history.replaceState({}, "", "/"); // optional (clean URL)
        }
    }, [searchParams]);

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

        return () => {
            document.body.style.overflow = prev;
        };
    }, [open]);

    const close = useCallback(() => setOpen(false), []);

    const Anchor = ({ href, label }: { href: `#${string}`; label: string }) => (
        <button
            className="w-full py-3 text-left text-sm font-medium text-zinc-900 transition hover:text-[#7A0022]"
            onClick={() => {
                close();

                setTimeout(() => {
                    const id = href.slice(1);
                    const el = document.getElementById(id);
                    if (el) {
                        el.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                    history.replaceState(null, "", href);
                }, 40);
            }}
        >
            {label}
        </button>
    );

    return (
        <>
            <header className="sticky top-0 z-50">
                <div className="bg-[#FBF7F2]/55 backdrop-blur-md">
                    <div className="mx-auto max-w-5xl px-5 sm:px-6">
                        <div className="relative flex items-center justify-center py-4">
                            <button
                                aria-label={open ? "Close menu" : "Open menu"}
                                className="absolute left-0 inline-flex h-10 w-10 items-center justify-center text-zinc-700 transition hover:text-zinc-900"
                                onClick={() => setOpen((v) => !v)}
                            >
                                <Hamburger />
                            </button>

                            <Link
                                href="/"
                                className="font-serif text-[15px] tracking-[0.22em] text-[#7A0022] font-semibold transition hover:text-zinc-900"
                            >
                                {monogram}
                            </Link>

                            <div className="absolute right-0 hidden items-center gap-4 sm:flex">
                                <Link
                                    href={rsvpHref}
                                    className="text-xs font-semibold tracking-[0.30em] text-[#7A0022] transition hover:text-[#64001C]"
                                >
                                    RSVP
                                </Link>

                                {showAdminButton && (
                                    <Link
                                        href="/admin"
                                        className="text-xs font-semibold tracking-[0.30em] text-[#7A0022] transition hover:text-[#64001C]"
                                    >
                                        Admin
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div
                className={`fixed inset-0 z-40 transition ${open ? "pointer-events-auto" : "pointer-events-none"
                    }`}
                aria-hidden={!open}
            >
                <div
                    className={`absolute inset-0 bg-black/40 transition-opacity ${open ? "opacity-100" : "opacity-0"
                        }`}
                    onClick={close}
                />

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

                            <button
                                className="text-xs font-semibold tracking-[0.30em] text-zinc-500 transition hover:text-zinc-900"
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
                                        return (
                                            <Anchor key={it.label} href={it.href} label={it.label} />
                                        );
                                    }

                                    return (
                                        <Link
                                            key={it.label}
                                            href={it.href}
                                            onClick={close}
                                            className="block py-3 text-sm font-medium text-zinc-900 transition hover:text-[#7A0022]"
                                        >
                                            {it.label}
                                        </Link>
                                    );
                                })}
                            </div>

                            <div className="mt-6 h-px w-full bg-black/10" />

                            <div className="mt-4 space-y-3">
                                <Link
                                    href={rsvpHref}
                                    onClick={close}
                                    className="block text-sm font-semibold tracking-[0.22em] text-[#7A0022] transition hover:text-[#64001C]"
                                >
                                    RSVP →
                                </Link>

                                {showAdminButton && (
                                    <Link
                                        href="/admin"
                                        onClick={close}
                                        className="block text-sm font-semibold tracking-[0.22em] text-[#7A0022] transition hover:text-[#64001C]"
                                    >
                                        Admin →
                                    </Link>
                                )}
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