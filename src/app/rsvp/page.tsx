import Link from "next/link";
import RsvpForm from "@/src/app/components/RsvpForm";
import FloralBackground from "@/src/app/components/FloralBackground";
import { cookies } from "next/headers";
import type { Session } from "@/src/app/components/RsvpForm";

export default async function RSVPPage() {
    const cookieStore = await cookies();
    const guestType = cookieStore.get("guestType")?.value;

    let lockedSession: Session | null = null;

    if (guestType === "private") {
        lockedSession = "Session 1";
    }

    return (
        <main className="relative min-h-screen text-zinc-800">
            <FloralBackground />

            {/* Atmospheric background — same as home page */}
            <div className="pointer-events-none fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-[radial-gradient(1200px_800px_at_10%_20%,rgba(122,0,34,0.08),transparent_60%),radial-gradient(900px_700px_at_90%_30%,rgba(176,16,62,0.07),transparent_55%)]" />
                <div className="absolute inset-0 bg-linear-to-b from-[#FBF7F2] via-[#FBF7F2] to-white" />
            </div>

            <div className="mx-auto max-w-xl px-5 pb-20 pt-10 sm:px-6 sm:pt-14">
                <div className="overflow-hidden rounded-4xl border border-white/60 bg-white shadow-[0_32px_80px_rgba(0,0,0,0.18),0_0_0_1px_rgba(122,0,34,0.06)]">

                    {/* Header */}
                    <div className="border-b border-black/6 px-8 py-8 sm:px-10 sm:py-10">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.5em] text-[#7A0022]/75">
                            RSVP
                        </p>
                        <h1 className="mt-2 whitespace-nowrap font-serif text-3xl font-semibold text-zinc-900 sm:text-5xl">
                            Confirm Attendance
                        </h1>
                        <p className="mt-2 text-[13px] font-semibold text-zinc-600">
                            3:00PM – 8:00PM | 2.5.2026, Saturday | Hacienda A-Park, Puchong
                        </p>
                        <p className="mt-3 text-sm leading-relaxed text-zinc-500">
                            Please select your assigned session, and we kindly invite you to wear your preferred theme color (other than silver) on the wedding day. Thank you!
                        </p>
                    </div>

                    {/* Form */}
                    <div className="px-8 pb-10 sm:px-10">
                        <RsvpForm lockedSession={lockedSession} />

                        <div className="mt-8 border-t border-black/6 pt-6 text-sm text-zinc-400">
                            Need help{" "}
                            <Link href="/contact" className="font-medium text-zinc-700 underline-offset-2 hover:underline">
                                Contact us →
                            </Link>
                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
}
