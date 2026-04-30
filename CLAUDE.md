# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A full-featured wedding website for Zhafirin & Ayuni built with Next.js App Router, Supabase, and rich animation libraries. The site has a public-facing wedding experience and a protected admin dashboard for managing RSVPs, messages, and visitor analytics.

## Commands

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint (Next.js core-web-vitals + TypeScript)
```

## Tech Stack

- **Framework**: Next.js 15 (App Router) with React 19 and TypeScript
- **Database**: Supabase (PostgreSQL) — browser client in [lib/supabase.ts](lib/supabase.ts), SSR client via `@supabase/ssr` in middleware
- **Styling**: Tailwind CSS v4, shadcn/ui (Radix Nova), CVA for component variants
- **Animations**: Framer Motion (scroll-driven), GSAP, Three.js/OGL (WebGL), Lenis (smooth scroll)
- **Maps**: Leaflet + React-Leaflet
- **Analytics**: Vercel Analytics + custom visitor tracking
- **Fonts**: Alex Brush, Cormorant Garamond (serif) — imported via [lib/fonts.ts](lib/fonts.ts)

## Architecture

### Routing & Auth

Middleware at [src/app/middleware.ts](src/app/middleware.ts) handles:
- Setting a `guestType` cookie based on URL query params (`?type=public|private`, `?session1`, `?public`)
- Protecting `/admin/*` routes — unauthenticated users are redirected to `/login`
- Supabase SSR session verification on every request

### App Structure

```
src/app/
├── page.tsx              # Home page (HeroSection, schedule preview, RSVP, messages, contact)
├── layout.tsx            # Root layout with Navbar + Vercel Analytics
├── middleware.ts         # Auth guard + guest-type cookie logic
├── components/           # Page-level components (not shared UI)
├── admin/                # Protected dashboard (RSVPs, messages, visitor map, schedule, etc.)
├── api/track/route.ts    # Edge runtime visitor tracking (IP, geo, device)
├── rsvp/                 # RSVP landing + success pages
├── our-story/            # Couple's story page
├── schedule/             # Full schedule page
├── venue/                # Venue details with map
└── contact/              # Contact form page

lib/                      # Shared utilities (supabase.ts, fonts.ts, utils.ts, schedule.ts)
components/ui/            # shadcn/ui components
public/                   # Static assets (video, images, SVGs)
```

### Database (Supabase)

Key tables:
- `rsvps` — guest RSVPs with name, message, session info, guest counts, `show_message` flag, `display_order`
- `link_visits` — visitor analytics (IP, country, city, lat/lon, device, referrer)

The Supabase browser client is created once in [lib/supabase.ts](lib/supabase.ts) and imported by client components. Server-side and middleware use `@supabase/ssr`.

### Component Patterns

- **Server components** for static/layout pages; **"use client"** for anything interactive or animated
- Shared inline helpers (Card, SectionHeader, Divider) are defined within page files, not extracted — don't over-abstract
- `cn()` from [lib/utils.ts](lib/utils.ts) (tailwind-merge + clsx) is the standard class utility

### Styling Conventions

- Primary color: `#7A0022` (burgundy)
- Background: `#FBF7F2` (cream)
- Serif body text uses Cormorant Garamond; decorative headings use Alex Brush
- CSS custom properties in [src/app/globals.css](src/app/globals.css) for design tokens

### API Routes

- `POST /api/track` — Edge runtime; reads Vercel geo headers (`x-vercel-ip-country`, `x-vercel-ip-city`) and falls back to `freeipapi.com` for geolocation; stores visit in `link_visits`

### Admin Dashboard

Lives at `/admin/*`. Each sub-route is a self-contained page:
- `/admin` — RSVP overview with filtering and sorting
- `/admin/compact` — print-optimized RSVP view
- `/admin/links` — visitor tracking map
- `/admin/messages` — guest message management with like counts
- `/admin/schedule` — schedule editor
- `/admin/groups`, `/admin/calendar`, `/admin/sessions`, `/admin/route`, `/admin/contact`, `/admin/changelog`

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL        # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY   # Supabase public anon key
```

## Path Aliases

`@/*` maps to `./*` (project root) — use for all imports except relative siblings.
