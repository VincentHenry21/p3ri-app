# P3RI — Cycle and Wellness Tracker

A mobile-first, gamified menstrual cycle and holistic wellness tracker with the
Peri mascot, a 4-phase cycle engine, and a local-first Firebase backend.

## Run locally (guest mode, no keys needed)

```bash
npm install
npm run dev
```

The app boots with zero errors and no environment variables. Use
**Continue in Guest / Quick Mode**, answer the 3 onboarding questions
(last period start, average cycle length, Peri style), and everything saves
to the browser's localStorage.

## Connect your own Firebase (in the browser, not in chat)

1. Create a Firebase project and enable Authentication (Google and/or
   Email/Password) and Cloud Firestore.
2. Paste the rules from `firestore.rules` into Firestore → Rules.
3. Open the deployed app, go to **Settings → Connect your own Firebase**,
   paste your Firebase web config JSON, and save. It is stored only in that
   browser's localStorage. Reload the page, then sign in with Google or
   email/password from the welcome screen.
4. Alternatively, for a build-time config, copy `.env.example` to
   `.env.local` and fill in the `VITE_FIREBASE_*` variables, then rebuild.
   Never commit a real `.env` file.

Firestore layout: `users/{uid}/profile`, `users/{uid}/cycles/{cycleId}`,
`users/{uid}/dailyLogs/{YYYY-MM-DD}`, `users/{uid}/healthChecks/{checkId}`.
Local data is always the source of truth; Firestore sync is best effort
and never blocks the UI.

## Ask Peri AI (optional)

Ask Peri answers from a rule-based coach by default. In **Settings**, you
can save a Gemini API key in a password field; it is stored only in that
browser's localStorage, never in code, and any API error falls back to the
rule-based coach. Never paste a key in chat.

## Cycle engine

Ovulation is anchored 14 days before the predicted next period start
(standard luteal calculation), never hardcoded to day 14. The fertile
window is the 5 days before ovulation through ovulation day. Phase bands
follow the spec for a 28-day cycle (menstrual 1–5, follicular 6–13,
ovulatory 14–16, luteal 17–28) and scale from the anchored ovulation day
for other cycle lengths. Regularity follows ACOG-aligned ranges:
cycle 21–35 days, bleed 2–7 days.

## Tests and build

```bash
npm test        # vitest, cycleEngine unit tests
npm run build   # TypeScript + Vite production build
```

## Deploy (GitHub Pages)

Push to GitHub and enable Pages on the `gh-pages` branch, or use the
included workflow: `.github/workflows/deploy.yml` builds on every push to
`main` and publishes `dist/` to Pages. The Vite `base` is set to
`/p3ri-app/` for project-page hosting; change it in `vite.config.ts` for
a custom domain or user site.

Health information in P3RI is educational only and is not medical advice.
