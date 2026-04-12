"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

const DirectionMapInner = dynamic(() => import("./DirectionMapInner"), {
    ssr: false,
    loading: () => (
        <div className="flex h-[380px] items-center justify-center bg-zinc-100">
            <p className="text-sm text-zinc-400">Loading map…</p>
        </div>
    ),
});

export function DirectionAnimation({ plain = false, interactive = false }: { plain?: boolean; interactive?: boolean }) {
    const [replayKey, setReplayKey] = useState(0);

    const replayBtn = (
        <button
            onClick={() => setReplayKey(k => k + 1)}
            className="absolute bottom-3 right-3 z-1000 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-md backdrop-blur hover:bg-white transition"
        >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Replay
        </button>
    );

    if (plain) {
        return (
            <div className="relative">
                <DirectionMapInner replayKey={replayKey} interactive={interactive} />
                {replayBtn}
            </div>
        );
    }

    return (
        <div className="relative mt-6 overflow-hidden rounded-[28px] border border-black/10 bg-white/80 shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
            <DirectionMapInner replayKey={replayKey} interactive={interactive} />
            {replayBtn}
        </div>
    );
}
