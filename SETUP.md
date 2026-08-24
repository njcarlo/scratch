# Gabay setup — Firebase / GCP (Spark free tier)

Gabay talks to **Firebase Auth** and **Cloud Firestore** from the browser. There is no
custom API server in Phase 1. If the Firebase env vars below are missing, the app
runs in **Demo Mode** (on-device `localStorage`) so you can still use it locally.

All of the live services below are on Google’s **Spark / always-free** allowances.
Do not enable Cloud Functions, Vertex AI, or Cloud SQL for this app — they are not
used, and several of them require the paid Blaze plan.

## Services (what runs where)

| Concern | Product | Free-tier notes |
| --- | --- | --- |
| Auth | Firebase Authentication (email/password + email link) | Spark: 50k MAU |
| Database | Cloud Firestore | Spark: 1 GiB, 50k reads/day, 20k writes/day |
| Security | `firestore.rules` (owner-only `users/{uid}/…`) | Deployed with the Firebase CLI |
| Web app (static) | Firebase Hosting | Spark: 10 GiB storage, 360 MB/day transfer. No credit card. |
| Web app (Next.js server) | Cloud Run | Always-free: 2M requests/month. **Requires a billing account** even if the bill stays $0. Prefer Hosting unless you need SSR. |

## 1. Create a Spark Firebase project

1. Open [Firebase console](https://console.firebase.google.com/) and create a project (Google Analytics optional — skip it).
2. Stay on the **Spark** (no-cost) plan. Do not upgrade to Blaze unless you later need Cloud Run.
3. **Authentication → Sign-in method**: enable **Email/Password**. Optionally enable **Email link (passwordless)**.
4. **Build → Firestore Database → Create database**. Start in **production** mode (our rules replace the default). Pick the closest region (e.g. `asia-southeast1` for the Philippines).
5. **Project settings → Your apps → Web**: register an app named `gabay`. Copy the config object.

## 2. Connect the app

```bash
cp .env.example .env.local
```

Fill in:

```
NEXT_PUBLIC_FIREBASE_API_KEY=…
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=…
NEXT_PUBLIC_FIREBASE_APP_ID=…
```

Put the same project id in `.firebaserc`. Then:

```bash
npm install
npx firebase login
npx firebase deploy --only firestore:rules,firestore:indexes
npm run dev
```

Sign-up / sign-in is at `/login`. New accounts go through onboarding; logs are written under `users/{uid}/` in Firestore and are only readable by that user.

Add `localhost` under Authentication → Settings → Authorized domains if email-link sign-in is enabled.

## 3. Local emulators (no cloud project required)

```bash
cp .env.example .env.local
```

Use dummy config plus:

```
NEXT_PUBLIC_FIREBASE_API_KEY=demo
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=localhost
NEXT_PUBLIC_FIREBASE_PROJECT_ID=demo-gabay
NEXT_PUBLIC_FIREBASE_APP_ID=1:0:web:demo
NEXT_PUBLIC_FIREBASE_EMULATOR=1
```

Then in two terminals:

```bash
npm run emulators     # Auth :9099, Firestore :8080, UI :4000
npm run dev
```

## 4. Host the web app

**Firebase Hosting (Spark, no billing account)** — static export:

```bash
npm run build:hosting
npx firebase deploy --only hosting
```

**Cloud Run (GCP always-free, billing account required to deploy):**

```bash
gcloud run deploy gabay \
  --source . \
  --region asia-southeast1 \
  --allow-unauthenticated \
  --set-env-vars NEXT_PUBLIC_FIREBASE_API_KEY=…,NEXT_PUBLIC_FIREBASE_PROJECT_ID=…
```

Pass the same `NEXT_PUBLIC_FIREBASE_*` values you use locally. Cloud Run will stay on the always-free quota for hobby traffic.

## Health-data note

Firestore rules allow a user to read/write only `users/{theirUid}/**`. There is no admin SDK and no shared collections in this phase. Demo Mode never sends data off-device.
