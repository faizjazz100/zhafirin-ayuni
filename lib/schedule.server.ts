import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { ScheduleItem } from "./schedule";

async function getSupabase() {
    const cookieStore = await cookies();
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { get: (name) => cookieStore.get(name)?.value } }
    );
}

export async function getSchedule(): Promise<ScheduleItem[]> {
    const supabase = await getSupabase();
    const { data, error } = await supabase
        .from("schedule")
        .select("*")
        .order("sort_order", { ascending: true });
    if (error) throw error;
    return data ?? [];
}

export async function getSchedulePreview(): Promise<ScheduleItem[]> {
    const supabase = await getSupabase();
    const { data, error } = await supabase
        .from("schedule")
        .select("*")
        .eq("show_in_preview", true)
        .order("sort_order", { ascending: true });
    if (error) throw error;
    return data ?? [];
}