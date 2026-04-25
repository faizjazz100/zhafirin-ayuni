import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";

function detectDevice(ua: string): "mobile" | "tablet" | "desktop" {
    if (/ipad|tablet|(android(?!.*mobile))/i.test(ua)) return "tablet";
    if (/mobile|android|iphone|ipod|blackberry|windows phone/i.test(ua)) return "mobile";
    return "desktop";
}

export async function POST(req: NextRequest) {
    try {
        const { param, visitor_id } = await req.json();
        if (!param || !visitor_id) return NextResponse.json({ ok: false }, { status: 400 });

        const country = req.headers.get("x-vercel-ip-country") ?? null;
        const rawCity = req.headers.get("x-vercel-ip-city");
        const city = rawCity ? decodeURIComponent(rawCity) : null;
        const forwarded = req.headers.get("x-forwarded-for");
        const ip = forwarded ? forwarded.split(",")[0].trim() : null;
        const ua = req.headers.get("user-agent") ?? "";
        const device = detectDevice(ua);

        let lat: number | null = null;
        let lng: number | null = null;

        if (ip && ip !== "127.0.0.1" && ip !== "::1" && !ip.startsWith("192.168")) {
            try {
                const geo = await fetch(`https://freeipapi.com/api/json/${ip}`, {
                    signal: AbortSignal.timeout(2000),
                });
                if (geo.ok) {
                    const data = await geo.json() as { latitude?: number; longitude?: number };
                    lat = data.latitude ?? null;
                    lng = data.longitude ?? null;
                }
            } catch { /* timeout or failure — skip coords */ }
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        await supabase.from("link_visits").insert({ param, visitor_id, country, city, ip, device, lat, lng });

        return NextResponse.json({ ok: true });
    } catch {
        return NextResponse.json({ ok: false }, { status: 500 });
    }
}
