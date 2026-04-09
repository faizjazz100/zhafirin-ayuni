"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";

const DirectionMapInner = dynamic(() => import("./DirectionMapInner"), {
    ssr: false,
    loading: () => (
        <div className="flex h-[380px] items-center justify-center bg-zinc-100">
            <p className="text-sm text-zinc-400">Loading map…</p>
        </div>
    ),
});

export default function DirectionModal() {
    const [open, setOpen] = useState(false);
    const [replayKey, setReplayKey] = useState(0);

    const replay = useCallback(() => setReplayKey(k => k + 1), []);

    return (
        <>
            {/* Trigger button */}
            <button
                onClick={() => setOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-black/10 bg-white/85 px-6 py-3 text-sm font-medium text-zinc-900 backdrop-blur hover:bg-white"
            >
                <svg className="h-4 w-4 text-[#7A0022]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                View Direction
            </button>

            {/* Modal */}
            <AnimatePresence>
                {open && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setOpen(false)}
                        />

                        {/* Sheet */}
                        <motion.div
                            className="fixed inset-x-0 bottom-0 z-50 flex max-h-[92dvh] flex-col rounded-t-[28px] bg-[#FBF7F2] shadow-[0_-20px_60px_rgba(0,0,0,0.18)]"
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", stiffness: 300, damping: 32 }}
                        >
                            {/* Handle */}
                            <div className="flex justify-center pt-3 pb-1">
                                <div className="h-1 w-10 rounded-full bg-black/15" />
                            </div>

                            {/* Header */}
                            <div className="flex items-center justify-between px-5 py-3">
                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#7A0022]/80">Venue</p>
                                    <h2 className="font-serif text-xl font-semibold text-zinc-900">Direction</h2>
                                </div>
                                <div className="flex items-center gap-2">
                                    {/* Replay */}
                                    <button
                                        onClick={replay}
                                        className="flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-sm hover:bg-zinc-50 active:scale-95 transition-transform"
                                    >
                                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        Replay
                                    </button>
                                    {/* Close */}
                                    <button
                                        onClick={() => setOpen(false)}
                                        className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-white text-zinc-500 shadow-sm hover:bg-zinc-50"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>

                            {/* Map */}
                            <div className="flex-1 overflow-hidden rounded-[20px] mx-4 mb-4 border border-black/10 shadow-sm">
                                <DirectionMapInner replayKey={replayKey} />
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
