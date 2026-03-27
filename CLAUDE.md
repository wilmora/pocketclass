@AGENTS.md

# PocketClass — Development Guide

## Stack
- **Frontend:** Next.js 16.2.1, React 19, TypeScript, CSS Modules
- **Backend:** Supabase (Auth, PostgreSQL, Storage)
- **Payments:** Stripe Checkout + Webhooks
- **Icons:** lucide-react
- **Styling:** CSS Modules + design tokens in src/styles/globals.css

## Architecture
- `src/app/` — Next.js App Router pages
- `src/lib/` — Core library code (auth, hooks, pricing, supabase client)
- `src/components/` — Shared components (Header, Footer)
- `src/types/` — TypeScript type definitions
- `supabase/migrations/` — Database schema

## Demo Mode
When `NEXT_PUBLIC_SUPABASE_URL` is not set or equals the placeholder, the app runs in **demo mode** using mock data from `src/lib/mock-data.ts`. All hooks and auth fall back to mock data automatically.

## Pricing Model
- Video: $2.00 per video
- Live session: $3.00 per session
- Platform commission: 15%
- Config in `src/lib/pricing.ts`

## Key Files
- `src/lib/auth-context.tsx` — Auth provider (Supabase + demo fallback)
- `src/lib/hooks.ts` — Data fetching hooks with demo mode fallback
- `src/lib/pricing.ts` — Pricing engine
- `src/lib/supabase/` — Supabase client setup (client, server, middleware)
- `src/proxy.ts` — Auth middleware (Next.js 16 proxy convention)

## Commands
- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run lint` — ESLint
