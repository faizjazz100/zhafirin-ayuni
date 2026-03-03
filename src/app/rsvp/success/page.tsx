import Link from "next/link";

export default function RsvpSuccessPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    const rawName = searchParams?.name;
    const name = Array.isArray(rawName) ? rawName[0] : rawName;
    return (
        <main className="min-h-screen bg-[#FBF7F2] text-zinc-800">
            {/* Soft background (matches site) */}
            <div className="pointer-events-none fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-[radial-gradient(1200px_800px_at_10%_10%,rgba(122,0,34,0.10),transparent_60%),radial-gradient(900px_700px_at_90%_20%,rgba(176,16,62,0.08),transparent_55%),radial-gradient(900px_700px_at_50%_100%,rgba(0,0,0,0.06),transparent_60%)]" />
                <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-[#FBF7F2]/55 to-white/80" />
            </div>

            <div className="mx-auto flex min-h-[calc(100vh-64px)] items-start justify-center px-5 pt-20 pb-16 sm:px-6">
                <div className="w-full max-w-xl rounded-[28px] border border-white/55 bg-white/65 p-8 text-center shadow-[0_20px_70px_rgba(0,0,0,0.10)] sm:p-12">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[#7A0022]/80">
                        Thank You
                    </p>

                    {name && (
                        <h1 className="mt-4 font-serif text-3xl font-semibold text-zinc-900 sm:text-4xl">
                            {name}
                        </h1>
                    )}

                    <p className="mt-6 text-[15px] leading-relaxed text-zinc-700">
                        Your RSVP has been successfully received. <br />
                        We truly appreciate you taking the time to respond and can’t wait to
                        celebrate this special day together.
                    </p>

                    <div className="mx-auto mt-8 h-px w-20 bg-black/10" />

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                        <Link
                            href="/"
                            className="inline-flex items-center justify-center rounded-full bg-[#7A0022] px-6 py-3 text-sm font-medium text-white shadow-[0_12px_26px_rgba(122,0,34,0.18)] hover:bg-[#64001C]"
                        >
                            Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}