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
        <main className="min-h-screen text-zinc-800">
            <FloralBackground />
            <div className="mx-auto max-w-3xl px-5 pb-16 pt-10 sm:px-6 sm:pt-14">
                <div className="rounded-[28px] border border-white/60 bg-white/90 p-6 shadow-[0_20px_70px_rgba(0,0,0,0.08)] sm:p-10">

                    <p className="text-xs text-[#7A0022]/80 uppercase tracking-[0.28em]">
                        RSVP
                    </p>

                    <h1 className="mt-3 font-serif text-4xl font-semibold sm:text-5xl">
                        Confirm Attendance
                    </h1>

                    <p className="mt-2 text-sm font-semibold text-zinc-700">
                        3:00PM – 8:00PM | 2.5.2026, Saturday | Hacienda A-Park, Puchong
                    </p>

                    <p className="mt-3 text-sm text-zinc-600">
                        Please select your assigned session, and we kindly invite you to wear your preferred theme color (other than silver) on the wedding day. Thank you!
                    </p>

                    <RsvpForm lockedSession={lockedSession} />

                    <div className="mt-8 text-sm text-zinc-500">
                        Need help{" "}
                        <Link href="/contact" className="font-medium text-zinc-900">
                            Contact us →
                        </Link>
                    </div>

                </div>
            </div>
        </main>
    );
}