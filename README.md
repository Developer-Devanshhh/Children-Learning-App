# Children Learning App — Dyslexia Support

A web application supporting children (roughly ages 6–12) with dyslexia through structured, multi-sensory reading and writing practice.

## What we're building, right now

A focused, three-component MVP:

1. **Psychometric assessment** — an initial test that identifies which reading/writing sub-skills a child needs to work on. (Content and scoring design owned by a teammate; this repo covers delivery, capture, and storage.)
2. **Kinesthetic canvas tracing engine** — the core deliverable. Children trace English letters (A–Z) and numbers (0–9) on a touchscreen, guided by an animated SVG stroke demo, scored against the actual shape they draw (not a placeholder), and reinforced with sound and — on supported devices — haptic feedback. The idea: engaging multiple senses (visual, auditory, tactile/kinesthetic) in one task builds stronger muscle memory than any single channel alone.
3. **Gaze/attention monitoring** — a webcam-based module that logs whether a child is engaged during practice, and degrades gracefully (rather than erroring) when their face isn't trackable.

**We are building the website only, for now.** No native app, no EEG, no non-English scripts, no AI-driven personalization yet — those are explicitly out of scope for this phase and documented separately as future work, not built into the current plan.

## Documents in this repo

| File | What's in it |
|---|---|
| **`PLAN.md`** | The actual technical plan for the website: stack decisions with justification and alternatives, system architecture, the tracing-accuracy scoring algorithm, the gaze-tracking failure-mode design, privacy/consent notes, and build sequencing. |
| **`APP.md`** | The later native-app migration plan (Android, via Capacitor). Not being worked on now — kept separate so it doesn't clutter the current website plan, and so it's easy to pick up when that phase actually starts. |

## Related repos

- **`Dyslexiaaa`** (private) — the research repo this project is grounded in: the SAMR-LD framework analysis, the full evidence review (EEG/neurofeedback, facial recognition, typography, learning styles), the Indic-orthography novelty analysis, and the original four-module architecture this MVP is deliberately scoped down from.
- **`project-dyslexia`** (private) — an earlier prototype, used here only as a UX/interaction-pattern reference for the tracing engine (see `PLAN.md` §7 for what's worth reusing vs. rebuilding).
