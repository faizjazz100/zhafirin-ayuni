"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import PageContainer from "@/src/app/components/PageContainer";
import { supabase } from "@/lib/supabase";

function StoryLike() {
    const [count, setCount] = useState(0);
    const [liked, setLiked] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [showInput, setShowInput] = useState(false);
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        supabase.from("story_likes").select("id", { count: "exact" }).then(({ count: c }) => {
            setCount(c ?? 0);
        });
        if (localStorage.getItem("story_liked_phone")) setLiked(true);
        if (localStorage.getItem("zh_admin")) setIsAdmin(true);
    }, []);

    function clearLike() {
        localStorage.removeItem("story_liked_phone");
        setLiked(false);
        setShowInput(false);
        setPhone("");
        setError("");
    }

    useEffect(() => {
        if (showInput) setTimeout(() => {
            inputRef.current?.focus();
            inputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 100);
    }, [showInput]);

    async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
        e.preventDefault();
        const cleaned = phone.trim().replace(/\s+/g, "");
        if (!cleaned) return;
        setLoading(true);
        setError("");
        const { error: err } = await supabase.from("story_likes").insert({ phone: cleaned });
        setLoading(false);
        if (err) {
            if (err.code === "23505") {
                setError("This number has already liked the story.");
            } else {
                setError("Something went wrong. Try again.");
            }
            return;
        }
        localStorage.setItem("story_liked_phone", cleaned);
        setLiked(true);
        setShowInput(false);
        setCount((c) => c + 1);
    }

    return (
        <div className="mt-10 flex flex-col items-center gap-3">
            <button
                onClick={() => { if (!liked) setShowInput(true); }}
                disabled={liked}
                className={`group flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition ${
                    liked
                        ? "bg-rose-50 text-rose-500 border border-rose-200 cursor-default"
                        : "bg-white/80 border border-black/10 text-zinc-700 hover:border-rose-300 hover:text-rose-500 hover:bg-rose-50"
                }`}
            >
                <svg
                    className={`h-4 w-4 transition-transform ${liked ? "scale-110" : "group-hover:scale-110"}`}
                    fill={liked ? "currentColor" : "none"}
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {liked ? "Liked!" : "Like this story"}
                <span className="ml-1 text-xs opacity-60">{count}</span>
            </button>

            {isAdmin && liked && (
                <button
                    type="button"
                    onClick={clearLike}
                    className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-400 hover:text-red-500 hover:border-red-200 transition"
                >
                    Reset (admin)
                </button>
            )}

            {showInput && (
                <form
                    onSubmit={handleSubmit}
                    className="w-full max-w-xs rounded-2xl border border-black/10 bg-white p-4 shadow-lg"
                >
                    <p className="mb-3 text-center text-xs text-zinc-500">Enter your phone number to like</p>
                    <input
                        ref={inputRef}
                        type="tel"
                        inputMode="numeric"
                        value={phone}
                        onChange={(e) => { setPhone(e.target.value); setError(""); }}
                        placeholder="e.g. 0123456789"
                        className="w-full rounded-xl border border-black/10 bg-zinc-50 px-4 py-3 text-base outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                    />
                    {error && <p className="mt-2 text-center text-xs text-red-500">{error}</p>}
                    <button
                        type="submit"
                        disabled={loading || !phone.trim()}
                        className="mt-3 w-full rounded-xl bg-rose-500 py-3 text-sm font-semibold text-white disabled:opacity-50 transition"
                    >
                        {loading ? "Submitting…" : "Like ♥"}
                    </button>
                    <button
                        type="button"
                        onClick={() => { setShowInput(false); setError(""); }}
                        className="mt-2 w-full py-1 text-sm text-zinc-400"
                    >
                        Cancel
                    </button>
                </form>
            )}
        </div>
    );
}

export default function OurStoryPage() {
    return (
        <main className="min-h-screen bg-[#FBF7F2] text-zinc-800">
            {/* Soft background (matches home) */}
            <div className="pointer-events-none fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-[radial-gradient(1200px_800px_at_10%_10%,rgba(122,0,34,0.10),transparent_60%),radial-gradient(900px_700px_at_90%_20%,rgba(176,16,62,0.08),transparent_55%),radial-gradient(900px_700px_at_50%_100%,rgba(0,0,0,0.06),transparent_60%)]" />
                <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-[#FBF7F2]/55 to-white/80" />
            </div>

            <PageContainer floral>
                <motion.article
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                    className="rounded-[28px] border border-white/55 bg-white/65 p-6 shadow-[0_20px_70px_rgba(0,0,0,0.10)] sm:p-10"
                >
                    <header className="text-center">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[#7A0022]/80">
                            Our Story
                        </p>

                        <h1 className="mt-2 font-serif text-4xl font-semibold text-zinc-900 sm:text-5xl">
                            #ZHAFYUNI
                        </h1>

                        <p className="mx-auto mt-3 max-w-2xl text-sm text-zinc-600">
                            A journey that began quietly, and grew into something beautiful.
                        </p>

                        <div className="mx-auto mt-6 h-px w-24 bg-black/10" />
                    </header>

                    {/* Couple Photo */}
                    <div className="mx-auto mt-8 max-w-lg">
                        <div className="relative overflow-hidden rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.12)]">
                            <Image
                                src="/couple.jpeg"
                                alt="Zhafirin & Ayuni"
                                width={800}
                                height={600}
                                className="w-full object-cover"
                                priority
                            />
                            {/* Subtle vignette overlay */}
                            <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-black/10" />
                        </div>
                        <p className="mt-2 text-center text-xs text-zinc-400 tracking-wide">
                            Zhafirin & Ayuni
                        </p>
                    </div>

                    {/* Story body */}
                    <div className="mx-auto mt-8 max-w-3xl">
                        <div className="mt-6 space-y-6 text-[15px] leading-relaxed text-zinc-700">
                            <p>
                                They met two years ago on the same working pathway, where their daily
                                routines crossed without much thought. Both were focused on their
                                careers, exchanging nothing more than brief greetings and occasional
                                smiles, friendly acquaintances in a busy world.
                            </p>

                            <div className="h-px w-full bg-black/10" />

                            <p>
                                Over time, casual hellos turned into conversations, then shared
                                lunches, and eventually a steady friendship. They supported one
                                another through work challenges and personal struggles, becoming a
                                constant presence in each othes&apos;s lives. Yet, quietly and unspoken,
                                one of them wished for something more. A love that felt close, but
                                still just out of reach.
                            </p>

                            <div className="h-px w-full bg-black/10" />

                            <p>
                                One evening, after a particularly difficult day, a heartfelt prayer
                                was whispered. The wish was simple but sincere: to find someone who
                                could be more than a friend, someone truly meant to stay. Unknowingly,
                                the answer to that prayer had already been standing right beside them
                                all along.
                            </p>

                            <div className="h-px w-full bg-black/10" />

                            <p>
                                As the seasons changed, so did their feelings. What began as
                                friendship slowly blossomed into love. Built on trust,
                                understanding, and the comfort of truly knowing one another. The
                                person who was once just a companion on the same working path became
                                the most important part of their life, a blessing quietly granted by
                                an answered prayer.
                            </p>

                            <div className="h-px w-full bg-black/10" />

                            <p>
                                In the end, their love story was not shaped by grand gestures or
                                sudden sparks, but by the gentle and steady growth of two hearts
                                finding their way to each other, proving that sometimes, the most
                                beautiful love stories begin as friendships and bloom when least
                                expected.
                            </p>
                        </div>
                    </div>

                    {/* <StoryLike /> */}

                    {/* Actions */}
                    <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
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

                    <p className="mt-6 text-center text-sm text-zinc-600">
                        © {new Date().getFullYear()} Zhafirin & Ayuni
                    </p>
                </motion.article>
            </PageContainer>
        </main>
    );
}