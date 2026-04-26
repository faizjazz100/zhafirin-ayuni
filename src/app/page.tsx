import Link from "next/link";
import Image from "next/image";
import { alexBrush } from "@/lib/fonts";
import FloralBackground from "@/src/app/components/FloralBackground";
import { Suspense } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWaze, faGoogle } from "@fortawesome/free-brands-svg-icons";
import MessageCarouselSection from "./components/MessageCarouselSection";
import SchedulePreview from "./components/SchedulePreview";
import DaysToGo from "./components/DaysToGo";
import { MotionDiv, MotionSection } from "./components/HomeAnimations";
import HomeContactCards from "./components/HomeContactCards";
import DirectionModal from "./components/DirectionModal";
import LinkTracker from "./components/LinkTracker";

export default function Page() {
  // ---- DATA (edit freely) ----
  const DATE_TOP = "May 2, 2026";
  const HASHTAG = "#ZHAFYUNI";
  const COUPLE = "Zhafirin & Ayuni";
  const SUBLINE = "Hacienda A-Park, Puchong, Selangor";
  const RSVP_DEADLINE = "30 April 2026";



  return (
    <main className="min-h-screen text-zinc-900 selection:bg-[#7A0022]/15">
      <Suspense fallback={null}><LinkTracker /></Suspense>
      <FloralBackground />
      {/* Soft background (no Iridescence) */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(1200px_800px_at_10%_10%,rgba(122,0,34,0.10),transparent_60%),radial-gradient(900px_700px_at_90%_20%,rgba(176,16,62,0.10),transparent_55%),radial-gradient(900px_700px_at_50%_100%,rgba(0,0,0,0.06),transparent_60%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-[#FBF7F2]/55 to-white/80" />
      </div>

      {/* HERO IMAGE */}
      <section className="mx-auto max-w-5xl px-5 pt-6 sm:px-6 sm:pt-10">
        <MotionDiv
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative overflow-hidden rounded-[32px] shadow-[0_40px_120px_rgba(0,0,0,0.25)]"
        >
          <div className="relative h-[350px] sm:h-[560px] md:h-[680px] overflow-hidden">

            {/* Slow subtle zoom */}
            <MotionDiv
              initial={{ scale: 0.85 }}
              animate={{ scale: [0.85, 0.95] }}
              transition={{
                duration: 5,
                ease: "easeInOut",
                repeat: 0,
                repeatType: "reverse",
              }}
              className="absolute inset-0"
            >
              <Image
                src="/logo.png"
                alt="Wedding"
                fill
                priority
                className="object-contain"
              />
            </MotionDiv>

            {/* Dark cinematic gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/10" />

            {/* Soft edge glow */}
            <div className="absolute inset-0 pointer-events-none rounded-[32px] ring-1 ring-white/10" />

            {/* Subtle vignette */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_55%,rgba(0,0,0,0.35))]" />
          </div>
        </MotionDiv>
      </section>

      {/* FLORAL DIVIDER */}
      <div className="mx-auto max-w-5xl px-5 sm:px-6">
        <div className="relative -mt-6 sm:-mt-8">   {/* ← negative margin to overlap hero */}
          <div className="mx-auto h-16 sm:h-20 rounded-[22px] bg-[#FBF7F2]" />
          <FloralCorners />
        </div>
      </div>

      {/* MAIN CENTER STACK */}
      <section className="mt-6 mx-auto max-w-5xl px-5 pb-14 pt-6 sm:px-6 sm:pb-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[12px] font-semibold uppercase tracking-[0.34em] text-zinc-600">
            Hacienda A-Park<br />
            Puchong, Selangor
          </p>

          <h1 className={`${alexBrush.className} mt-5 text-5xl text-zinc-800 sm:text-6xl`}>
            {COUPLE}
          </h1>

          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.34em] text-zinc-600">
            {DATE_TOP} | SATURDAY
          </p>

          <div className="mt-3 text-[12px] font-semibold uppercase tracking-[0.30em] text-zinc-600">
            <DaysToGo date={DATE_TOP} />
          </div>

          <div className="mt-8">
            <div className="mx-auto w-full max-w-[520px] rounded-[26px] border border-black/10 bg-white/75 p-7 shadow-[0_18px_60px_rgba(0,0,0,0.07)]">
              <p className="text-sm font-semibold tracking-[0.18em] text-zinc-800">
                {DATE_TOP.toUpperCase()} | SATURDAY
              </p>
              <div className="mx-auto mt-4 h-px w-20 bg-black/10" />
              <div className="mt-4">
                <Link
                  href="/rsvp"
                  className="inline-flex items-center justify-center rounded-xl bg-[#7A0022] px-8 py-3 text-xs font-semibold tracking-[0.30em] text-white hover:opacity-90"
                >
                  Click to RSVP
                </Link>
              </div>

              <div className="mt-6 text-[12px] text-zinc-600">
                RSVP by{" "}
                <span className="font-semibold text-zinc-900">{RSVP_DEADLINE}</span>
              </div>
              <div className="mx-auto mt-4 h-px w-20 bg-black/10" />
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.15em] text-zinc-600">
                Wedding Attire:<br />
                Any color except silver
              </p>
              <div className="mt-4 text-xs font-semibold tracking-[0.25em] text-[#7A0022]">
                {HASHTAG}
              </div>
            </div>
          </div>

        </div>

        <MessageCarouselSection></MessageCarouselSection>

        <div className="mt-14 text-center">
          <div className="text-[13px] font-semibold tracking-[0.38em] text-zinc-700">
            WEDDING DAY
          </div>
          <div className="mx-auto mt-4 h-px w-24 bg-black/10" />
        </div>

        {/* OUR STORY */}
        <MotionSection
          id="our-story"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mt-10"
        >
          <Card>
            <SectionHeader
              label="Our Story"
              title={HASHTAG}
              subtitle="A journey that began quietly, and grew into something beautiful."
            />

            <div className="mt-6 space-y-5 text-[15px] leading-relaxed text-zinc-700">
              <p>
                They met two years ago on the same working pathway, where their daily routines crossed
                without much thought. Both were focused on their careers, exchanging nothing more than
                brief greetings and occasional smiles, friendly acquaintances in a busy world.
              </p>
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/our-story"
                className="inline-flex w-full items-center justify-center rounded-full bg-[#7A0022] px-5 py-2.5 text-sm text-white hover:bg-white"
              >
                Continue reading →
              </Link>
            </div>
          </Card>
        </MotionSection>

        {/* DETAILS */}
        <MotionSection
          id="details"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mt-10"
        >
          <Card>
            <SectionHeader
              label="Details"
              title="Schedule Preview"
              subtitle="Full schedule is on the Schedule page."
              action={<PrimaryButton href="/schedule">View Full Schedule</PrimaryButton>}
            />
            <SchedulePreview />
          </Card>
        </MotionSection>

        {/* VENUE */}
        <section id="venue" className="mt-10">
          <Card>
            <SectionHeader label="Venue" title="Hacienda A-Park, Puchong" />

            <p className="mt-4 text-[15px] leading-7 text-zinc-700">
              3275, Jalan Pulau Meranti, Kampung Pulau Meranti, 47100 Puchong, Selangor
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <DirectionModal />
              <SecondaryButton
                href="https://maps.app.goo.gl/SfCJExkyFnWcZZ2J9"
                icon={<FontAwesomeIcon icon={faGoogle} className="h-5 w-5" />}
              >
                Open in Google Maps
              </SecondaryButton>

              <SecondaryButton
                href="https://waze.com/ul/hw282bew6e&navigate=yes"
                icon={<FontAwesomeIcon icon={faWaze} className="h-6 w-6" />}
              >
                Open in Waze
              </SecondaryButton>
              <AccentButton href="/venue">
                Open Venue Page
              </AccentButton>
            </div>
          </Card>
        </section>

        {/* CONTACT */}
        <MotionSection
          id="contact"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mt-10"
        >
          <Card>
            <SectionHeader
              label="Contact"
              title="Contacts"
              subtitle="If you have any questions, feel free to contact us."
              action={
                <Link
                  href="/contact"
                  className="hidden rounded-full border border-black/10 bg-white/80 px-5 py-2.5 text-sm text-zinc-900 backdrop-blur hover:bg-white sm:inline-flex"
                >
                  Open Contact Page
                </Link>
              }
            />

            <HomeContactCards />

            <div className="mt-6 sm:hidden">
              <Link
                href="/contact"
                className="inline-flex w-full items-center justify-center rounded-full bg-[#7A0022] px-5 py-2.5 text-sm text-white hover:bg-white"
              >
                Open Contact Page
              </Link>
            </div>
          </Card>
        </MotionSection>

        {/* FOOTER */}
        <footer className="mt-12 text-center text-sm text-zinc-600">
          © {new Date().getFullYear()} {COUPLE}
        </footer>
      </section>
    </main>
  );
}

function Hamburger() {
  return (
    <div className="grid gap-1.5">
      <div className="h-0.5 w-6 rounded bg-zinc-700" />
      <div className="h-0.5 w-6 rounded bg-zinc-700" />
      <div className="h-0.5 w-6 rounded bg-zinc-700" />
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[28px] border border-white/55 bg-white/65 p-6 shadow-[0_20px_70px_rgba(0,0,0,0.10)] sm:p-10">
      {children}
    </div>
  );
}

function FloralCorners() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto flex max-w-5xl items-start justify-between px-5 sm:px-6">
      <div className="h-24 w-48 opacity-95">
        <FloralSVG side="left" />
      </div>
      <div className="h-24 w-48 opacity-95">
        <FloralSVG side="right" />
      </div>
    </div>
  );
}

function FloralSVG({ side }: { side: "left" | "right" }) {
  const flip = side === "right";
  return (
    <svg
      viewBox="0 0 520 240"
      className="h-full w-full"
      style={flip ? { transform: "scaleX(-1)" } : undefined}
    >
      <defs>
        <linearGradient id="petal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7A0022" stopOpacity="0.95" />
          <stop offset="1" stopColor="#B0103E" stopOpacity="0.85" />
        </linearGradient>
        <linearGradient id="rose" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#F4D7DA" stopOpacity="0.95" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.9" />
        </linearGradient>
      </defs>

      <path
        d="M90 150c40-30 85-40 120-20-45 35-80 55-120 20Z"
        fill="#3E6B54"
        opacity="0.55"
      />
      <path
        d="M150 165c55-40 105-55 150-30-55 45-105 70-150 30Z"
        fill="#2F5B45"
        opacity="0.45"
      />

      <g transform="translate(70,70)">
        <circle cx="60" cy="70" r="16" fill="#2A0A10" opacity="0.35" />
        <path d="M60 18c22 8 34 24 28 40-18-10-34-22-28-40Z" fill="url(#petal)" />
        <path d="M18 60c8-22 24-34 40-28-10 18-22 34-40 28Z" fill="url(#petal)" />
        <path d="M60 122c-22-8-34-24-28-40 18 10 34 22 28 40Z" fill="url(#petal)" />
        <path d="M122 60c-8 22-24 34-40 28 10-18 22-34 40-28Z" fill="url(#petal)" />
        <circle cx="60" cy="70" r="16" fill="#7A0022" opacity="0.9" />
      </g>

      <g transform="translate(240,95) scale(1.05)">
        <path d="M60 18c22 8 34 24 28 40-18-10-34-22-28-40Z" fill="url(#petal)" opacity="0.95" />
        <path d="M18 60c8-22 24-34 40-28-10 18-22 34-40 28Z" fill="url(#petal)" opacity="0.92" />
        <path d="M60 122c-22-8-34-24-28-40 18 10 34 22 28 40Z" fill="url(#petal)" opacity="0.9" />
        <path d="M122 60c-8 22-24 34-40 28 10-18 22-34 40-28Z" fill="url(#petal)" opacity="0.92" />
        <circle cx="60" cy="70" r="18" fill="#7A0022" opacity="0.9" />
      </g>

      <g transform="translate(170,125)">
        <circle cx="52" cy="52" r="34" fill="#2A0A10" opacity="0.2" />
        <circle cx="52" cy="52" r="28" fill="url(#rose)" />
        <path d="M32 52c10-18 30-18 40 0-10 18-30 18-40 0Z" fill="#F0C9CF" opacity="0.9" />
        <circle cx="52" cy="52" r="10" fill="#FFFFFF" opacity="0.85" />
      </g>

      <g transform="translate(360,135) scale(0.9)">
        <circle cx="52" cy="52" r="28" fill="url(#rose)" />
        <path d="M34 52c9-16 27-16 36 0-9 16-27 16-36 0Z" fill="#F0C9CF" opacity="0.9" />
        <circle cx="52" cy="52" r="9" fill="#FFFFFF" opacity="0.85" />
      </g>
    </svg>
  );
}

function SectionHeader({
  label,
  title,
  subtitle,
  action,
}: {
  label: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[#7A0022]/80">
          {label}
        </p>
        <h2 className="mt-2 font-serif text-3xl font-semibold text-zinc-900">
          {title}
        </h2>
        {subtitle ? <p className="mt-2 text-sm text-zinc-600">{subtitle}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

function PrimaryButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-full bg-[#7A0022] px-6 py-3 text-sm font-medium text-white shadow-[0_12px_26px_rgba(122,0,34,0.22)] hover:bg-[#64001C]"
    >
      {children}
    </Link>
  );
}

function AccentButton({
  href,
  children,
  icon,
}: {
  href: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center justify-center gap-2 rounded-full bg-[#7A0022] px-6 py-3 text-sm font-medium text-white shadow-[0_12px_26px_rgba(122,0,34,0.18)] hover:opacity-95"
    >
      {children}
      {icon}
    </a>
  );
}

function SecondaryButton({
  href,
  children,
  icon,
}: {
  href: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center justify-center gap-2 rounded-full border border-black/10 bg-white/85 px-6 py-3 text-sm font-medium text-zinc-900 backdrop-blur hover:bg-white"
    >
      {children}
      {icon}
    </a>
  );
}

function InfoCard({
  time,
  title,
}: {
  time: string;
  title: string;
}) {
  return (
    <div className="rounded-3xl border border-black/10 bg-white/75 px-6 py-5 shadow-[0_10px_30px_rgba(0,0,0,0.06)]">

      {/* FIXED LAYOUT */}
      <div className="grid grid-cols-[90px_1fr] items-start gap-4">

        {/* TIME (always 1 line) */}
        <div className="whitespace-nowrap text-base font-semibold text-zinc-900">
          {time}
        </div>

        {/* TITLE (can wrap nicely) */}
        <div className="min-w-0 text-right">
          <p className="text-sm font-semibold leading-snug text-zinc-800">
            {title}
          </p>
        </div>

      </div>
    </div>
  );
}
