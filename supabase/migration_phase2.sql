-- LyraLearn Phase 2 — Supabase SQL Migration
-- Run this in your Supabase project: SQL Editor → New Query → Paste → Run
-- -------------------------------------------------------------------------

-- ── 1. Child profiles ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS children (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  age_band    TEXT NOT NULL CHECK (age_band IN ('6-7','8-9','10-12')),
  avatar_seed TEXT NOT NULL DEFAULT 'lyra',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE children ENABLE ROW LEVEL SECURITY;

CREATE POLICY "parents can manage their own children"
  ON children
  FOR ALL
  USING (parent_id = auth.uid())
  WITH CHECK (parent_id = auth.uid());

-- ── 2. Tracing sessions ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tracing_sessions (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id             UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  grapheme_id          TEXT NOT NULL,
  age_band             TEXT NOT NULL,
  score_overall        NUMERIC(5,2),
  score_coverage       NUMERIC(5,2),
  score_start          NUMERIC(5,2),
  score_stroke_count   NUMERIC(5,2),
  band                 TEXT NOT NULL CHECK (band IN ('amazing','great','getting-there','together')),
  attempt_index        SMALLINT NOT NULL DEFAULT 1,
  guide_playback_count SMALLINT NOT NULL DEFAULT 1,
  raw_stroke_data      JSONB,
  session_duration_ms  INTEGER,
  started_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE tracing_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "parents can view their children's sessions"
  ON tracing_sessions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM children c
      WHERE c.id = tracing_sessions.child_id
        AND c.parent_id = auth.uid()
    )
  );

-- ── 3. Session learning curve (per-attempt log within a session) ──────────
CREATE TABLE IF NOT EXISTS session_learning_curve (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  UUID REFERENCES tracing_sessions(id) ON DELETE CASCADE,
  grapheme_id TEXT NOT NULL,
  attempt     SMALLINT NOT NULL,
  band        TEXT NOT NULL CHECK (band IN ('amazing','great','getting-there','together')),
  started_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE session_learning_curve ENABLE ROW LEVEL SECURITY;

CREATE POLICY "parents can view learning curve"
  ON session_learning_curve
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM tracing_sessions ts
      JOIN children c ON c.id = ts.child_id
      WHERE ts.id = session_learning_curve.session_id
        AND c.parent_id = auth.uid()
    )
  );

-- ── Helpful indexes ────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_tracing_sessions_child   ON tracing_sessions(child_id);
CREATE INDEX IF NOT EXISTS idx_tracing_sessions_grapheme ON tracing_sessions(grapheme_id);
CREATE INDEX IF NOT EXISTS idx_learning_curve_session   ON session_learning_curve(session_id);
