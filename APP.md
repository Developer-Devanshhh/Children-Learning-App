# App Migration Plan — Later Phase

> **Status: not started, not urgent.** This document exists so the migration path is thought through and ready when the team decides to act on it — not because it's next. See `PLAN.md` for what's actually being built right now (the website).

---

## When to start this phase

Only once the web MVP (all three components in `PLAN.md`) is stable and has been validated on a real low-end Android device for performance — specifically the concurrent canvas-drawing + WASM ML-inference load described in `PLAN.md` §1.5. Wrapping an app that hasn't been performance-checked in its own browser context first just moves the discovery of that problem later, not away.

## Recommended approach: Capacitor

**Capacitor** wraps the static Vite build (the same `dist/` folder already produced for web deployment) into a native iOS/Android shell, running it in the OS's WebView. This is a **zero-rewrite path** precisely because the frontend was already built as a pure client-side SPA in `PLAN.md` §1.1 — nothing about the website architecture needs to change to make this possible later; that was a deliberate choice, not a coincidence.

### What it unlocks that the web version can't do

| Capability | Web (browser) | Capacitor-wrapped app |
|---|---|---|
| Haptic feedback | Android Chrome only — iOS Safari blocks the Vibration API entirely, no workaround | Full native access via `@capacitor/haptics`, including real iOS Taptic Engine support if an iOS build is ever made |
| App store distribution | Not applicable | Play Store (and App Store, if pursued) listing |
| Offline-first feel | Works via the IndexedDB outbox pattern already in `PLAN.md` §2, but still "a website" | Feels like a native app; icon on the home screen, no browser chrome |
| Camera access for the gaze module | `getUserMedia`, works today | Should keep working largely unchanged inside Capacitor's WebView — but validate this specifically (see risks below) |

### Plugins to plan for

- `@capacitor/haptics` — the actual payoff of this migration for the tracing engine's multi-sensory feedback goal
- `@capacitor/app` — lifecycle events (pause/resume, back button on Android)
- `@capacitor/preferences` — light native local storage, if IndexedDB behavior differs inside a WebView in practice

### Real risk to test for, not assume away

Concurrent WASM ML inference (the gaze module) + real-time canvas/SVG drawing (the tracing engine), both running inside a WebView rather than a full browser process, is the one place native-vs-web performance parity is least guaranteed. Budget explicit testing time on a genuinely low-end Android device — not a developer's own phone — before treating this migration as done.

---

## Alternatives (recap — full reasoning in `PLAN.md` §1.1)

| Alternative | When it would have been the better call instead |
|---|---|
| **React Native + React Native Web** | If a single codebase for web+native had been wanted from day one. Not chosen because it front-loads risk (RNW's rough edges on canvas/SVG-heavy interaction) that the "website first, app later" sequencing doesn't require taking on yet. |
| **Flutter** | If native performance and native camera/haptics access (no WebView layer at all) mattered more than reusing the web codebase and the team's JS fluency. The real cost: MediaPipe Tasks Vision's mature JS/WASM runtime has no Flutter equivalent — gaze tracking would need a different, less mature approach (`google_mlkit_face_mesh_detection` or platform channels). |

These remain available if Capacitor's WebView-performance risk turns out to be a real blocker after testing — but they mean rebuilding the UI layer, which Capacitor specifically avoids.

---

## What does *not* need to change for this migration

Everything in `PLAN.md` §2–§5 — the system architecture, the data model, the RBAC model, the scoring algorithm, the gaze state machine, and the privacy/consent approach — carries over unchanged. Supabase doesn't care whether requests come from a browser tab or a WebView. This is the direct payoff of having architected the backend as a BaaS behind a static frontend from the start, rather than something that has to be re-thought at migration time.
