"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

const TRACKED_PARAMS = ["wedding"];

export default function LinkTracker() {
    const searchParams = useSearchParams();

    useEffect(() => {
        const param = TRACKED_PARAMS.find((p) => searchParams.has(p));
        if (!param) return;

        const sessionKey = `tracked_${param}`;
        if (sessionStorage.getItem(sessionKey)) return;

        let visitorId = localStorage.getItem("lv_visitor_id");
        if (!visitorId) {
            visitorId = typeof crypto.randomUUID === "function"
                ? crypto.randomUUID()
                : `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
            localStorage.setItem("lv_visitor_id", visitorId);
        }

        sessionStorage.setItem(sessionKey, "1");

        fetch("/api/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ param, visitor_id: visitorId }),
        }).catch(() => { });
    }, [searchParams]);

    return null;
}
