import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import RsvpForm from "@/src/app/components/RsvpForm";

export default async function RSVPPage() {
    const cookieStore = await cookies();
    const guestType = cookieStore.get("guestType")?.value;

    if (guestType === "private") {
        redirect("/rsvp-private");
    }
    return (
        <main className="min-h-screen bg-[#FBF7F2] text-zinc-800">
            <div className="mx-auto max-w-3xl px-5 pb-16 pt-10 sm:px-6 sm:pt-14">
                <div className="rounded-[28px] border border-white/60 bg-white/70 p-6 shadow-[0_20px_70px_rgba(0,0,0,0.08)] backdrop-blur sm:p-10">
                    <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">
                        RSVP
                    </p>

                    <h1 className="mt-3 font-serif text-4xl font-semibold sm:text-5xl">
                        Confirm Attendance
                    </h1>

                    <p className="mt-2 text-sm font-semibold text-zinc-700">
                        3:00PM – 8:00PM | 2.5.2026, Saturday | Hacienda A-Park, Puchong
                    </p>

                    <p className="mt-3 text-sm text-zinc-600">
                        This RSVP is for the <span className="font-semibold">Public</span>{" "}
                        session.
                    </p>

                    <RsvpForm session="Public" />

                    <div className="mt-8 text-sm text-zinc-500">
                        Need help?{" "}
                        <Link href="/contact" className="font-medium text-zinc-900">
                            Contact us →
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}