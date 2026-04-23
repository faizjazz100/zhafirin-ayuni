import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";

export async function POST(req: NextRequest) {
    try {
        const { param, visitor_id } = await req.json();
        if (!param || !visitor_id) return NextResponse.json({ ok: false }, { status: 400 });

        const country = req.headers.get("x-vercel-ip-country") ?? null;
        const city = req.headers.get("x-vercel-ip-city") ?? null;

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        await supabase.from("link_visits").insert({ param, visitor_id, country, city });

        return NextResponse.json({ ok: true });
    } catch {
        return NextResponse.json({ ok: false }, { status: 500 });
    }
}
