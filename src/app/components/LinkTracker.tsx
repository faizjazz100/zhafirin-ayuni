"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

const TRACKED_PARAMS = ["wedding"];

export default function LinkTracker() {
    const searchParams = useSearchParams();

    useEffect(() => {
        const param = TRACKED_PARAMS.find((p) => searchParams.has(p)) ?? "direct";

        const cooldownKey = `lv_last_${param}`;
        const last = Number(localStorage.getItem(cooldownKey) ?? 0);
        if (Date.now() - last < 30 * 60 * 1000) return; // 30-min cooldown

        let visitorId = localStorage.getItem("lv_visitor_id");
        if (!visitorId) {
            visitorId = typeof crypto.randomUUID === "function"
                ? crypto.randomUUID()
                : `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
            localStorage.setItem("lv_visitor_id", visitorId);
        }

        localStorage.setItem(cooldownKey, String(Date.now()));

        fetch("/api/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ param, visitor_id: visitorId }),
        }).catch(() => { });
    }, [searchParams]);

    return null;
}
