# Gabay — Handoff / Milestone

Status snapshot for picking this project back up in a fresh session (e.g. a
different Claude account/session). Read this first, then `ARCHITECTURE.md`
(if present) and `SETUP.md` (if present) for deeper detail — if those two
don't exist yet, they're on the to-do list below and this file is the
source of truth in the meantime.

## What this is

**Gabay** — "the everyday PCOS/PMOS companion built around Filipino life."
A mobile-first Next.js app for Filipino women managing PCOS/PMOS: cycle
tracking, symptom logging, a Filipino-food-aware food log, self-data
insights, and light health tracking — built to explicit medical-safety
rules (never diagnostic, always "educational / from your data / ask your
doctor" tiering) and to a phased MVP-first plan the product owner
specified in detail in this conversation's history.

Repo: `njcarlo/scratch`, branch `claude/delete-repo-content-jx79il` (this
branch was previously wiped clean at the user's request, then this app was
built from scratch on it — do not confuse with `main`, which still has old,
unrelated content and has not been merged).

## How to run it

```
npm install
npm run dev      # http://localhost:3000
npm run build    # production build — currently passes clean
npm run lint     # eslint . — currently passes clean
```

No environment variables are required to run and use the app. Without
`NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` set, it runs in
**Demo Mode**: a single on-device guest identity, all data in
`localStorage`. This is intentional, not a placeholder — see "Architecture"
below.

## Architecture (decided, don't re-litigate without reason)

- **Next.js 16.3.2, App Router, TypeScript strict, Tailwind.** Mobile-first
  (`max-w-app` = 480px column), no separate native app in this phase.
- **Data layer is backend-swappable by design.** `src/lib/data/repository.ts`
  defines a `DataRepository` interface. `local-repository.ts` (localStorage)
  and `supabase-repository.ts` (real Postgres via Supabase, RLS-scoped) both
  implement it. `src/lib/data/index.ts#getRepository()` picks one based on
  whether Supabase env vars are set. **Screens never talk to storage
  directly** — always through the React Query hooks in `src/lib/queries/*`.
- **SQL schema + RLS**: `supabase/migrations/0001_init.sql`. Only Phase-1
  tables exist (profiles, cycle_logs, symptom_logs, food_logs, weight_logs,
  medications). This has never been run against a real Supabase project in
  this environment (no credentials available) — it's written correctly but
  unverified end-to-end. Verifying it against a real project is real,
  valuable next work.
- **Auth**: `src/lib/auth/AuthProvider.tsx` — same real/demo split as the
  data layer.
- **i18n is mandatory and already wired**: `src/lib/i18n/dictionary.ts` has
  every user-facing string in `en` and `tl-en` (Taglish, natural
  code-switching, not machine translation). Components call `useT()` /
  `t("some.key")` — **never hardcode UI strings**. Keep this discipline for
  anything you add.
- **Medical safety copy** lives in `src/lib/safety.ts` and the `safety.*`
  dictionary keys, surfaced via `<DisclaimerBanner>` and `<InfoTierBadge
  tier="education"|"personal"|"clinician">`. Every screen that shows
  anything computed from user data uses these — keep doing that for new
  screens.
- **Filipino Food Intelligence**: `src/lib/data/food-db.ts` (seed dataset,
  ~55 items — Jollibee/McDo/Mang Inasal/Chowking/KFC/Starbucks/7-Eleven +
  home-cooked Filipino dishes + plain staples), accessed only through
  `food-service.ts`. Every item has `dataConfidence` (`verified` for plain
  staples, `estimated` for branded/composite dishes — nothing claims exact
  restaurant nutrition it doesn't have). `meal-guidance.ts` is a
  **deterministic, rule-based** "no diet culture" meal reflection — it is
  explicitly *not* the AI Companion (no LLM is configured in this build;
  see Section 37 of the product spec re: not faking integrations).
- **Charts**: recharts. Loaded the `dataviz` skill before building
  `insights/page.tsx` — single-series magnitude charts (teal/mango, thin
  bars, 2px lines), no categorical-palette validation needed since nothing
  here is multi-series categorical.

## What's built (Phase 1 MVP, per the product owner's own phase list)

- [x] Project scaffold, design tokens, icon set, UI primitives (Button,
      Card, Chip, DisclaimerBanner, InfoTierBadge)
- [x] Data model (`src/lib/types.ts`), repository pattern, Supabase +
      Local implementations, SQL migration
- [x] Auth abstraction (Supabase + Demo Mode)
- [x] i18n system (en / tl-en) with a large existing dictionary
- [x] React Query hooks over the repository (profile, cycle, symptoms,
      food, weight, medications, settings/export/clear)
- [x] Filipino food database + service + rule-based meal reflection
- [x] App shell: header, bottom nav (Home/Cycle/Food/Insights/Health),
      AI Companion FAB, secondary nav (Healthcare/Community/Profile), Demo
      Mode banner
- [x] Onboarding wizard (8 steps: welcome+language, PCOS status, goals,
      cycle baseline, symptoms, lifestyle, meds/supplements, finish)
- [x] Home dashboard
- [x] Cycle module (log period/spotting, stats, history)
- [x] Symptoms daily check-in (`/symptoms`, linked from Home; not a bottom
      nav tab, per the recommended nav in the spec)
- [x] Food module (search seed DB, log meals, today's list, meal
      reflection note)
- [x] Insights (cycle length chart, symptom frequency, mood trend, weight
      trend, food pattern shares — all clearly tiered as "from your data")
- [x] Health module (Phase-1 scope: weight tracking; medications shown
      read-only from onboarding; labs are a stub — matches the spec's own
      phase list, which puts full med/lab management in Phase 2)
- [x] Profile/Settings

`npm run build` and `npm run lint` both pass clean as of this commit
(verified after `profile/page.tsx`, the last file written).

## What's NOT built yet (in priority order)

1. **Stub screens**: `/ai`, `/community`, `/healthcare` routes don't exist
   yet, but the shell already links to them (AI FAB → `/ai`, header icons →
   `/healthcare` and `/community`) — **these routes will 404 right now**.
   Dictionary keys `stub.ai.*`, `stub.community.*`, `stub.healthcare.*`
   already exist and are written — just need three small page components
   using them (see any existing screen for the pattern: `<DisclaimerBanner>`
   isn't needed there, just a centered icon + `t("stub.x.title")` +
   `t("stub.x.body")`, styled consistent with the rest of the app).
3. **PRODUCT.md / ARCHITECTURE.md** — not yet written as standalone docs;
   this HANDOFF.md currently carries that context instead. Worth splitting
   out if the project continues growing, but not blocking.
4. **SETUP.md** — instructions for connecting a real Supabase project
   (create project → run `supabase/migrations/0001_init.sql` → set the two
   `NEXT_PUBLIC_SUPABASE_*` env vars) — not yet written.
5. Everything in "Deferred, documented, not built" from the original plan
   remains deferred: medication/lab CRUD UI, doctor-report export, real AI
   chat, Community + moderation, provider directory, admin dashboards,
   payments, notifications, native mobile app. Don't build these without
   the product owner asking — they were explicitly phased out.

## Working conventions to keep

- No hardcoded user-facing strings — dictionary + `useT()` only.
- No screen imports `localStorage`, Supabase, or `food-db.ts` directly —
  always go through `src/lib/data`, `src/lib/auth`, or `food-service.ts`.
- Every AI/insight-like claim gets an `<InfoTierBadge>` and sits behind a
  `<DisclaimerBanner>` — never state a food/symptom claim as fact.
- Run `npm run build && npm run lint` after any batch of changes, before
  calling it done.
