import Link from "next/link";
import { alexBrush } from "@/lib/fonts";
import FloralBackground from "@/src/app/components/FloralBackground";
import { Suspense } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWaze, faGoogle } from "@fortawesome/free-brands-svg-icons";
import MessageCarouselSection from "./components/MessageCarouselSection";
import SchedulePreview from "./components/SchedulePreview";
import { MotionSection } from "./components/HomeAnimations";
import HomeContactCards from "./components/HomeContactCards";
import DirectionModal from "./components/DirectionModal";
import LinkTracker from "./components/LinkTracker";
import HeroSection from "./components/HeroSection";
import SessionCards from "./components/SessionCards";

// ─── Page data ────────────────────────────────────────────────────────────────
const COUPLE = "Zhafirin & Ayuni";
const DATE_DISPLAY = "2 May 2026";
const HASHTAG = "#ZHAFYUNI";
const VENUE_SHORT = "Hacienda A-Park, Puchong";
const VENUE_FULL = "3275, Jalan Pulau Meranti, Kampung Pulau Meranti, 47100 Puchong, Selangor";
const GOOGLE_MAPS = "https://maps.app.goo.gl/SfCJExkyFnWcZZ2J9";
const WAZE = "https://waze.com/ul/hw282bew6e&navigate=yes";

export default function Page() {
  return (
    <main className="min-h-screen text-zinc-900 selection:bg-[#7A0022]/15">
      <Suspense fallback={null}><LinkTracker /></Suspense>
      <FloralBackground />

      {/* Atmospheric background — visible below the hero */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(1200px_800px_at_10%_20%,rgba(122,0,34,0.08),transparent_60%),radial-gradient(900px_700px_at_90%_30%,rgba(176,16,62,0.07),transparent_55%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#FBF7F2] via-[#FBF7F2] to-white" />
      </div>

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <HeroSection
        couple={COUPLE}
        date={DATE_DISPLAY}
        location={VENUE_SHORT}
        hashtag={HASHTAG}
        rsvpHref="/rsvp"
      />

      {/* ── INVITATION CARD (floats up over the hero bottom edge) ──────────── */}
      <div className="relative z-10 -mt-16 sm:-mt-24">
        <div className="mx-auto max-w-lg px-5 sm:px-6">
          <div className="overflow-hidden rounded-[32px] border border-white/60 bg-white shadow-[0_32px_80px_rgba(0,0,0,0.18),0_0_0_1px_rgba(122,0,34,0.06)]">

            <div className="px-8 py-9 text-center sm:px-10">

              {/* Ornament */}
              <div className="flex items-center justify-center gap-2.5">
                <div className="h-px w-10 bg-[#7A0022]/18" />
                <FloralOrnament />
                <div className="h-px w-10 bg-[#7A0022]/18" />
              </div>

              <p className="mt-5 text-[9px] font-semibold uppercase tracking-[0.52em] text-zinc-400">
                You Are Cordially Invited
              </p>

              <h2 className={`${alexBrush.className} mt-3 whitespace-nowrap text-4xl text-zinc-900 sm:text-5xl`}>
                {COUPLE}
              </h2>

              <Divider />

              <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.36em] text-zinc-700">
                {DATE_DISPLAY} · Saturday
              </p>
              <p className="mt-1.5 text-[12px] text-zinc-500">{VENUE_SHORT}</p>

              <Divider />

              <div className="mt-5">
                <Link
                  href="/rsvp"
                  className="inline-flex items-center justify-center rounded-full bg-[#7A0022] px-9 py-3.5 text-[10px] font-semibold tracking-[0.4em] text-white shadow-[0_14px_32px_rgba(122,0,34,0.28)] transition hover:bg-[#64001C]"
                >
                  CLICK TO RSVP
                </Link>
              </div>

              <Divider />

              <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.26em] text-zinc-500">
                Wedding Attire
              </p>
              <p className="mt-1 text-sm text-zinc-700">Any colour except silver</p>

              <p className="mt-4 text-[11px] font-semibold tracking-[0.32em] text-[#7A0022]">
                {HASHTAG}
              </p>

            </div>
          </div>
        </div>
      </div>

      {/* ── CONTENT SECTIONS ─────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-5xl px-5 pb-16 pt-14 sm:px-6 sm:pb-24">

        {/* Session Summary Cards */}
        <SessionCards />

        {/* Wishes */}
        <MessageCarouselSection />

        {/* Section divider */}
        <div className="mt-16 flex items-center gap-4 text-center">
          <div className="h-px flex-1 bg-black/8" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.46em] text-zinc-500">
            Wedding Day
          </p>
          <div className="h-px flex-1 bg-black/8" />
        </div>

        {/* OUR STORY */}
        <MotionSection
          id="our-story"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="mt-10"
        >
          <Card>
            <SectionHeader
              label="Our Story"
              title={HASHTAG}
              subtitle="A journey that began quietly, and grew into something beautiful."
              action={
                <Link
                  href="/our-story"
                  className="hidden shrink-0 rounded-full bg-[#7A0022] px-5 py-2.5 text-sm font-medium text-white shadow-[0_8px_24px_rgba(122,0,34,0.22)] transition hover:bg-[#64001C] sm:inline-flex"
                >
                  Read full story
                </Link>
              }
            />
            <p className="mt-6 text-[15px] leading-[1.75] text-zinc-600">
              They met two years ago on the same working pathway, where their daily routines crossed without much thought. Both were focused on their careers, exchanging nothing more than brief greetings and occasional smiles, friendly acquaintances in a busy world.
            </p>
            <div className="mt-7 sm:hidden">
              <Link
                href="/our-story"
                className="inline-flex w-full items-center justify-center rounded-full bg-[#7A0022] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#64001C]"
              >
                Continue reading →
              </Link>
            </div>
          </Card>
        </MotionSection>

        {/* SCHEDULE */}
        <MotionSection
          id="schedule"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="mt-8"
        >
          <Card>
            <SectionHeader
              label="Details"
              title="Schedule"
              subtitle="Timeline of the ceremony. Times are approximate."
              action={
                <Link
                  href="/schedule"
                  className="hidden shrink-0 rounded-full bg-[#7A0022] px-5 py-2.5 text-sm font-medium text-white shadow-[0_8px_24px_rgba(122,0,34,0.22)] transition hover:bg-[#64001C] sm:inline-flex"
                >
                  View full schedule
                </Link>
              }
            />
            <div className="mt-6">
              <SchedulePreview />
            </div>
            <div className="mt-6 sm:hidden">
              <Link
                href="/schedule"
                className="inline-flex w-full items-center justify-center rounded-full bg-[#7A0022] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#64001C]"
              >
                View full schedule
              </Link>
            </div>
          </Card>
        </MotionSection>

        {/* VENUE */}
        <MotionSection
          id="venue"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="mt-8"
        >
          <Card>
            <SectionHeader
              label="Venue"
              title={VENUE_SHORT}
              action={
                <Link
                  href="/venue"
                  className="hidden shrink-0 rounded-full bg-[#7A0022] px-5 py-2.5 text-sm font-medium text-white shadow-[0_8px_24px_rgba(122,0,34,0.22)] transition hover:bg-[#64001C] sm:inline-flex"
                >
                  Venue page
                </Link>
              }
            />
            <p className="mt-4 text-[15px] leading-7 text-zinc-600">{VENUE_FULL}</p>

            <div className="mt-6 flex flex-wrap gap-3">
              <DirectionModal />
              <ExternalButton
                href={GOOGLE_MAPS}
                icon={<FontAwesomeIcon icon={faGoogle} className="h-4 w-4" />}
              >
                Google Maps
              </ExternalButton>
              <ExternalButton
                href={WAZE}
                icon={<FontAwesomeIcon icon={faWaze} className="h-5 w-5" />}
              >
                Waze
              </ExternalButton>
            </div>

            <div className="mt-4 sm:hidden">
              <Link
                href="/venue"
                className="inline-flex w-full items-center justify-center rounded-full bg-[#7A0022] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#64001C]"
              >
                Open venue page
              </Link>
            </div>
          </Card>
        </MotionSection>

        {/* CONTACT */}
        <MotionSection
          id="contact"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="mt-8"
        >
          <Card>
            <SectionHeader
              label="Contact"
              title="Get in Touch"
              subtitle="Any questions about the event, location, or RSVP? We're here."
              action={
                <Link
                  href="/contact"
                  className="hidden shrink-0 rounded-full bg-[#7A0022] px-5 py-2.5 text-sm font-medium text-white shadow-[0_8px_24px_rgba(122,0,34,0.22)] transition hover:bg-[#64001C] sm:inline-flex"
                >
                  Contact page
                </Link>
              }
            />
            <div className="mt-6">
              <HomeContactCards />
            </div>
            <div className="mt-6 sm:hidden">
              <Link
                href="/contact"
                className="inline-flex w-full items-center justify-center rounded-full bg-[#7A0022] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#64001C]"
              >
                Open contact page
              </Link>
            </div>
          </Card>
        </MotionSection>

        {/* Footer */}
        <footer className="mt-16 flex flex-col items-center gap-3 text-center">
          <div className="flex items-center gap-3">
            <div className="h-px w-12 bg-black/10" />
            <p className="text-[10px] font-semibold tracking-[0.35em] text-[#7A0022]/60">{HASHTAG}</p>
            <div className="h-px w-12 bg-black/10" />
          </div>
          <p className="text-sm text-zinc-500">© {new Date().getFullYear()} {COUPLE}</p>
        </footer>

      </div>
    </main>
  );
}

// ─── Shared UI helpers ────────────────────────────────────────────────────────

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-[32px] border border-white/60 bg-white p-6 shadow-[0_32px_80px_rgba(0,0,0,0.18),0_0_0_1px_rgba(122,0,34,0.06)] sm:p-10">
      {children}
    </div>
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
        <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-[#7A0022]/75">{label}</p>
        <h2 className="mt-2 font-serif text-4xl font-semibold text-zinc-900">{title}</h2>
        {subtitle && <p className="mt-2 text-sm text-zinc-500">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

function ExternalButton({
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
      className="inline-flex items-center justify-center gap-2 rounded-full border border-black/10 bg-white/85 px-5 py-2.5 text-sm font-medium text-zinc-900 backdrop-blur transition hover:bg-white"
    >
      {icon}
      {children}
    </a>
  );
}

function Divider() {
  return (
    <div className="mx-auto mt-5 flex items-center justify-center gap-2">
      <div className="h-px w-14 bg-[#7A0022]/12" />
      <div className="h-1 w-1 rotate-45 bg-[#7A0022]/25" />
      <div className="h-px w-14 bg-[#7A0022]/12" />
    </div>
  );
}

function FloralOrnament() {
  return (
    <svg
      viewBox="0 0 32 20"
      className="h-4 w-8 text-[#7A0022]/35"
      fill="currentColor"
      aria-hidden="true"
    >
      <ellipse cx="16" cy="10" rx="5" ry="3.5" fillOpacity="0.5" />
      <ellipse cx="5" cy="10" rx="4" ry="2.5" fillOpacity="0.3" />
      <ellipse cx="27" cy="10" rx="4" ry="2.5" fillOpacity="0.3" />
      <circle cx="16" cy="10" r="2" />
      <circle cx="3" cy="10" r="1.2" fillOpacity="0.5" />
      <circle cx="29" cy="10" r="1.2" fillOpacity="0.5" />
    </svg>
  );
}
