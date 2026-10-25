# P3RI QA checklist (spec section 5, 10 checkpoints)

Status key: PASS = verified in this repo; CODE = implemented in code, live
verification needs the user's own Firebase project; DEFERRED = intentionally
not built, with the reason stated. Nothing here is claimed live that was not
checked.

1. **Zero-config boot** — PASS. `npm run build` succeeds with no `.env`
   file. The production build was served locally and rendered in a
   headless Chromium shell with no env vars: the welcome modal
   ("Welcome to P3RI", "Continue in Guest") appeared with zero
   unhandled errors. Firebase init is a no-op without a config.
2. **Auth state persistence** — CODE. `onAuthStateChanged` in
   `src/lib/firebase.ts` restores the signed-in user on reload, and
   `App.tsx` hides the auth modal once a profile exists, so there is no
   login flash for returning users. Live sign-in verification needs the
   user's Firebase project with Google/email methods enabled.
3. **Guest-to-account data merge** — CODE. On sign-in, `App.tsx`
   pushes the locally stored profile and every local daily log into
   `users/{uid}/profile` and `users/{uid}/dailyLogs/{date}` (best
   effort, local data stays the source of truth). Live verification
   needs the user's Firebase project.
4. **Cycle math edge cases** — PASS. Vitest: ovulation anchored 14 days
   before the predicted next start for 21-, 28-, and 35-day cycles
   (never hardcoded day 14), fertile window, phase boundaries, and
   regularity ranges. `npm test` passes.
5. **Phase theme transitions** — PASS (visual). The app shell uses a
   300ms ease-out transition, the top-bleed gradient, mascot
   expression, and coaching tip all derive from the same phase value,
   so they change together when the phase changes.
6. **Mascot interactive states** — PASS (logic). 12 expressions in
   `src/lib/periExpressions.ts` with priority selection from symptoms,
   mood, flow, sleep, streak, journal, and phase, plus tap-to-pet
   bounce and haptic pulse. Unit-tested for priority order. The full
   set is shown as a gallery strip under Peri on Home.
7. **Health check clinical guardrails** — PASS. `HealthCheckCenter`
   flags cycles outside 21–35 days and bleeds outside 2–7 days with a
   gentle, non-alarmist note recommending a clinician check-in if the
   pattern repeats. Educational only, not a diagnosis.
8. **PWA and app icon rendering** — PASS (files). `public/manifest.json`,
   both SVG squircle icons (`p3ri-icon-flame.svg`, `p3ri-icon-cloud.svg`),
   and `<link rel="apple-touch-icon">` in `index.html` are present.
   Install-to-home-screen rendering on a real device was not tested
   here.
9. **Mobile touch targets and safe areas** — PASS (code). Buttons,
   inputs, chips, and calendar days all have a 44px minimum height,
   and the bottom nav uses `env(safe-area-inset-bottom)`. Layout is
   capped at 430px, centered on desktop, full-bleed on mobile.
10. **GitHub secret hygiene** — PASS. `.gitignore` covers `.env` and
    `.env.local`; `.env.example` contains variable names only; a repo
    scan found no API keys and no placeholder Firebase project values
    in code or docs. Firebase config and the Gemini API key are only
    ever stored in the user's browser localStorage, never in chat or
    in this repo.

Deliberately deferred (spec-optional, not in the assigned component list):
- **4-digit privacy PIN / biometric lock.** Not built: a local PIN that
  can lock a user out of their own health data is a worse failure mode
  than no PIN, and real biometric lock is native-only. Revisit only if
  explicitly requested, with a recovery path.
- **True 3D mascot model.** Peri is layered SVG/CSS (plush day mode,
  jelly-cloud mode) rather than a WebGL 3D model; the spec's 12
  expressions, breathing animation, and tap reaction are all present.
