# LyraLearn — Letter & Number Tracing App for Children

> A dyslexia-supportive, multi-sensory learning app where children trace letters and numbers guided by an animated companion character (Lyra). Built with a real-time scoring engine, audio feedback, and a children-first design system.

---

## Overview

LyraLearn helps children aged 6–12 practise letter and number formation through:

- **Guided SVG animation** — watch the stroke order before you draw
- **Real-time ink feedback** — ink turns **green** when on-track, **red** when off-track
- **Waypoint-crossing scorer** — calibrated per age band (6–7, 8–9, 10–12)
- **Howler.js audio engine** — draw ticks, waypoint chimes, completion fanfare (zero external audio files — all sounds generated via Web Audio API)
- **Lyra** — a friendly SVG companion character that floats and wiggles
- **Alphabet & Number tabs** — separate A–Z and 0–9 selection grids
- **Parent Portal** — parents and teachers can create child profiles and track progress seamlessly across devices.

---

## Tech Stack

| Layer            | Technology                                                                    |
| ---------------- | ----------------------------------------------------------------------------- |
| Framework        | **React 19** + **TypeScript 5/6**                                   |
| Build tool       | **Vite 8** with `@tailwindcss/vite` plugin                            |
| Styling          | **Tailwind CSS v4** (CSS-first config via `@theme`)                   |
| Drawing          | **perfect-freehand** — pressure-aware ink strokes                      |
| Audio            | **Howler.js** — cross-browser audio with Web Audio API tone generation |
| State management | **Zustand** (Auth, Session, and Child Profile stores)                       |
| Backend / Auth   | **Supabase** (PostgreSQL Database, Authentication, Row Level Security)              |
| Offline Sync     | **idb-keyval** (IndexedDB offline outbox for sessions)                  |
| Icons            | **Lucide React**                                                        |
| Font             | **Nunito** (Google Fonts — dyslexia-friendly rounded letterforms)      |
| Deployment       | **Vercel** (Continuous Deployment via GitHub)                           |

---

## Project Structure

```
src/
├── App.tsx                          # Root state machine (loading → auth → pick-child → home → practise)
├── index.css                        # Tailwind v4 design system tokens + keyframes
├── main.tsx
│
├── data/
│   └── letter-corpus/
│       └── graphemes.ts             # A–Z + 0–9 stroke paths, waypoints, start-points
│
├── lib/
│   ├── supabase.ts                  # Typed Supabase client (handles offline mode gracefully)
│   ├── offlineOutbox.ts             # IndexedDB queue that flushes session logs when back online
│   └── utils.ts                     # cn() helper (clsx + tailwind-merge)
│
├── stores/
│   ├── useAuthStore.ts              # Zustand: signIn / signUp / session initialization
│   ├── useChildStore.ts             # Zustand: fetch and manage child profiles
│   └── useSessionStore.ts           # Zustand: tracks attempts and logs scores to DB/outbox
│
└── modules/
    ├── 01-canvas-tracing/
    │   ├── TracingCanvas.tsx        # Core canvas: guide animation, ink, live feedback
    │   ├── FeedbackOverlay.tsx      # Post-check result card (qualitative, no numbers)
    │   └── scorer.ts                # Waypoint-crossing v0 scorer (age-calibrated)
    │
    ├── 04-attention-agent/
    │   └── Lyra.tsx                 # SVG companion character (idle float + wiggle)
    │
    ├── 05-session-orchestrator/
    │   ├── LetterSelector.tsx       # Home screen with A–Z / 0–9 tabs
    │   └── PractiseScreen.tsx       # Full tracing session screen
    │
    ├── 06-auth/
    │   └── AuthScreen.tsx           # Parent login / registration portal
    │
    ├── 07-child-profiles/
    │   └── ChildSelector.tsx        # Pick or create a child profile
    │
    └── audio/
        └── audioEngine.ts           # Howler.js wrapper — all sounds generated at runtime
```

---

## Getting Started

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Supabase (Optional but Recommended):**
   Copy `.env.local.example` to `.env.local` and add your project URL and anon key.
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
   *(If you skip this step, the app gracefully degrades to an offline-only preview mode).*

3. **Database Migration:**
   Paste the contents of `supabase/migration_phase2.sql` into your Supabase SQL Editor and run it.

4. **Start the app:**
   ```bash
   npm run dev
   # → http://localhost:5173
   ```

### Deployment

LyraLearn is configured for automatic deployment on **Vercel**. 
1. Import the GitHub repository into Vercel.
2. Add your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as Vercel Environment Variables.
3. Deploy!

---

## Scoring System

The **waypoint-crossing scorer** (v0) evaluates each traced stroke without showing children any numbers. It returns a qualitative band:

| Band                    | Meaning | Visual / Audio                 |
| ----------------------- | ------- | ------------------------------ |
| **Amazing**       | ≥ 80%  | Sparkles icon + rising fanfare |
| **Great**         | ≥ 60%  | Star icon + fanfare            |
| **Getting there** | ≥ 40%  | Smile icon + gentle melody     |
| **Together**      | < 40%   | Handshake icon + gentle melody |

Score weights: 60% waypoint coverage · 20% start-point accuracy · 20% stroke count match.

Age-band tolerances:

- 6–7 years: 45 px
- 8–9 years: 32 px
- 10–12 years: 22 px

---

## Roadmap

### Phase 1 ✅

- [X] A–Z + 0–9 stroke corpus with waypoints
- [X] SVG animated guide with stroke-order animation
- [X] perfect-freehand ink with real-time colour feedback
- [X] Waypoint-crossing scorer (age-calibrated)
- [X] Howler.js audio engine (programmatically generated sounds)
- [X] Lyra companion character
- [X] Alphabet / Number tab selection

### Phase 2 ✅

- [X] Supabase auth (Parent accounts)
- [X] Child profiles (Multi-profile Netflix/Disney+ style selection)
- [X] Session data logging (stroke timing, scores, attempts)
- [X] Offline IndexedDB outbox → auto-sync when online
- [X] Vercel Continuous Deployment

### Phase 3 (Planned)

- [ ] Lowercase letter corpus (a–z)
- [ ] Psychometric assessment module (Module 02)
- [ ] Attention monitoring — Lyra calls child's name when idle (Module 04)
- [ ] Parent / teacher dashboard with session analytics
- [ ] ML-based personalised difficulty adaptation

---

## Design Principles

- **No numbers shown to children** — all feedback is qualitative and warm
- **Dyslexia-safe typography** — Nunito font, 0.08 em letter-spacing, 1.75 line-height
- **Touch-first** — pointer capture, `touch-action: none`, 48 px minimum touch targets
- **Zero external audio files** — all sounds built from PCM at runtime
- **Modular architecture** — each feature is an isolated module in `src/modules/`
