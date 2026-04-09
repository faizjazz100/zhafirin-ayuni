"use client";

import dynamic from "next/dynamic";

const DirectionMapInner = dynamic(() => import("./DirectionMapInner"), {
    ssr: false,
    loading: () => (
        <div className="flex h-[380px] items-center justify-center bg-zinc-100">
            <p className="text-sm text-zinc-400">Loading map…</p>
        </div>
    ),
});

export function DirectionAnimation({ plain = false }: { plain?: boolean }) {
    if (plain) {
        return <DirectionMapInner />;
    }
    return (
        <div className="mt-6 overflow-hidden rounded-[28px] border border-black/10 bg-white/80 shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
            <DirectionMapInner />
        </div>
    );
}
