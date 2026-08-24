# Gabay — Handoff / Milestone

Status snapshot for picking this project back up in a fresh session (e.g. a
different Claude account/session). Read this first, then `SETUP.md` for how
to connect a free Firebase/GCP project. `ARCHITECTURE.md` is still not a
standalone file — this handoff carries that context.

## What this is

**Gabay** — "the everyday PCOS/PMOS companion built around Filipino life."
A mobile-first Next.js app for Filipino women managing PCOS/PMOS: cycle
tracking, symptom logging, a Filipino-food-aware food log, self-data
insights, and light health tracking — built to explicit medical-safety
rules (never diagnostic, always "educational / from your data / ask your
doctor" tiering) and to a phased MVP-first plan the product owner
specified in detail in this conversation's history.

Repo: `njcarlo/scratch`, working branch `cursor/gabay-stub-screens-8960`
(based on `claude/delete-repo-content-jx79il`). Do not confuse with
`main`, which still has old, unrelated content and has not been merged.

## How to run it

```
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run lint     # eslint .
```

No environment variables are required to run and use the app. Without
`NEXT_PUBLIC_FIREBASE_API_KEY` / `NEXT_PUBLIC_FIREBASE_PROJECT_ID` set, it
runs in **Demo Mode**: a single on-device guest identity, all data in
`localStorage`. This is intentional, not a placeholder — see "Architecture"
below. With those vars set, `/login` uses Firebase Auth and logs go to
Cloud Firestore. See SETUP.md (Spark / always-free GCP).

## Architecture (decided, don't re-litigate without reason)

- **Next.js 16.3.2, App Router, TypeScript strict, Tailwind.** Mobile-first
  (`max-w-app` = 480px column), no separate native app in this phase.
- **Live backend is Firebase on GCP, Spark/always-free only.** Auth =
  Firebase Authentication. Database = Cloud Firestore (`users/{uid}/…`).
  Hosting = Firebase Hosting (static export) or Cloud Run for `next start`.
  No Cloud Functions, Vertex AI, or Cloud SQL.
- **Data layer is backend-swappable by design.** `src/lib/data/repository.ts`
  defines a `DataRepository` interface. `local-repository.ts` (localStorage)
  and `firebase-repository.ts` (Firestore, rules in `firestore.rules`) both
  implement it. `src/lib/data/index.ts#getRepository()` picks one based on
  whether Firebase env vars are set. **Screens never talk to storage
  directly** — always through the React Query hooks in `src/lib/queries/*`.
- **Auth**: `src/lib/auth/AuthProvider.tsx` — same real/demo split as the
  data layer. Live mode is email/password (and optional email link) via
  Firebase Auth; `/login` is the screen; Profile has Sign out.
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
- [x] Data model (`src/lib/types.ts`), repository pattern, Firebase
      Firestore + Local implementations, owner-only security rules
- [x] Auth abstraction (Firebase Auth + Demo Mode) and `/login`
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
- [x] Stub screens for `/ai`, `/community`, `/healthcare` (coming-soon
      placeholders; dictionary keys `stub.*` already existed)
- [x] SETUP.md — Spark-plan Firebase Auth + Firestore + Hosting, optional
      Cloud Run always-free, local emulators

`npm run build` and `npm run lint` both pass clean as of this commit.

## What's NOT built yet (in priority order)

1. **PRODUCT.md / ARCHITECTURE.md** — not yet written as standalone docs;
   this HANDOFF.md currently carries that context instead. Worth splitting
   out if the project continues growing, but not blocking.
2. **A provisioned cloud project in this environment** — there are no GCP
   credentials here, so Firestore rules have not been deployed to a real
   project. Use SETUP.md (or `npm run emulators`) to verify.
3. Everything in "Deferred, documented, not built" from the original plan
   remains deferred: medication/lab CRUD UI, doctor-report export, real AI
   chat, Community + moderation, provider directory, admin dashboards,
   payments, notifications, native mobile app. Don't build these without
   the product owner asking — they were explicitly phased out.

## Working conventions to keep

- No hardcoded user-facing strings — dictionary + `useT()` only.
- No screen imports `localStorage`, Firebase, or `food-db.ts` directly —
  always go through `src/lib/data`, `src/lib/auth`, or `food-service.ts`.
- Every AI/insight-like claim gets an `<InfoTierBadge>` and sits behind a
  `<DisclaimerBanner>` — never state a food/symptom claim as fact.
- Run `npm run build && npm run lint` after any batch of changes, before
  calling it done.
