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

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | **React 19** + **TypeScript 6** |
| Build tool | **Vite 8** with `@tailwindcss/vite` plugin |
| Styling | **Tailwind CSS v4** (CSS-first config via `@theme`) |
| Drawing | **perfect-freehand** — pressure-aware ink strokes |
| Audio | **Howler.js** — cross-browser audio with Web Audio API tone generation |
| State management | **Zustand** (session store, future child profile) |
| Backend / Auth | **Supabase** (schema defined, integration pending Phase 2) |
| Icons | **Lucide React** |
| Linting | **Oxlint** |
| Font | **Nunito** (Google Fonts — dyslexia-friendly rounded letterforms) |

---

## Project Structure

```
src/
├── App.tsx                          # Root two-screen state machine (home → practise)
├── index.css                        # Tailwind v4 design system tokens + keyframes
├── main.tsx
│
├── data/
│   └── letter-corpus/
│       └── graphemes.ts             # A–Z + 0–9 stroke paths, waypoints, start-points
│
├── lib/
│   └── utils.ts                     # cn() helper (clsx + tailwind-merge)
│
└── modules/
    ├── 01-canvas-tracing/
    │   ├── TracingCanvas.tsx        # Core canvas: guide animation, ink, live feedback
    │   ├── FeedbackOverlay.tsx      # Post-check result card (qualitative, no numbers)
    │   └── scorer.ts               # Waypoint-crossing v0 scorer (age-calibrated)
    │
    ├── 04-attention-agent/
    │   └── Lyra.tsx                 # SVG companion character (idle float + wiggle)
    │
    ├── 05-session-orchestrator/
    │   ├── LetterSelector.tsx       # Home screen with A–Z / 0–9 tabs
    │   └── PractiseScreen.tsx       # Full tracing session screen
    │
    └── audio/
        └── audioEngine.ts          # Howler.js wrapper — all sounds generated at runtime
```

---

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev
# → http://localhost:5173

# Type check
npx tsc --noEmit

# Lint
npm run lint
```

---

## Scoring System

The **waypoint-crossing scorer** (v0) evaluates each traced stroke without showing children any numbers. It returns a qualitative band:

| Band | Meaning | Visual / Audio |
|---|---|---|
| **Amazing** | ≥ 80% | Sparkles icon + rising fanfare |
| **Great** | ≥ 60% | Star icon + fanfare |
| **Getting there** | ≥ 40% | Smile icon + gentle melody |
| **Together** | < 40% | Handshake icon + gentle melody |

Score weights: 60% waypoint coverage · 20% start-point accuracy · 20% stroke count match.

Age-band tolerances:
- 6–7 years: 45 px
- 8–9 years: 32 px  
- 10–12 years: 22 px

---

## Real-time Feedback

While drawing, the child receives instant visual + audio feedback:

- **Green ink** + pulsing green proximity ring → pen is within 45 px of the next target waypoint
- **Red ink** → pen has drifted > 90 px from any waypoint
- **Waypoint chime** → plays each time a waypoint is crossed
- **Draw tick** → soft sound every ~120 ms while the pen moves
- **Stroke-done thunk** → plays when the pen is lifted

---

## Roadmap

### Phase 1 (Current) ✅
- [x] A–Z + 0–9 stroke corpus with waypoints
- [x] SVG animated guide with stroke-order animation
- [x] perfect-freehand ink with real-time colour feedback
- [x] Waypoint-crossing scorer (age-calibrated)
- [x] Howler.js audio engine (programmatically generated sounds)
- [x] Lyra companion character
- [x] Alphabet / Number tab selection

### Phase 2 (Planned)
- [ ] Supabase auth + child profiles
- [ ] Session data logging (stroke timing, pressure, coverage per waypoint)
- [ ] Offline IndexedDB outbox → sync when online
- [ ] Lowercase letter corpus

### Phase 3 (Planned)
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

---

## Contributing

This is a research + prototype project. If you have expertise in dyslexia intervention, Orton-Gillingham methodology, or child UX, contributions and feedback are very welcome.
