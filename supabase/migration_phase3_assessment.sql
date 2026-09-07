-- =============================================================================
-- LyraLearn Phase 3 — Psychometric Assessment & Personalization Engine Migration
-- =============================================================================

-- ── 1. Assessment Sessions ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS assessment_sessions (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id                UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  assessment_language     TEXT NOT NULL DEFAULT 'en-US',
  age_band                TEXT NOT NULL CHECK (age_band IN ('6-7', '8-9', '10-12')),
  grade_level             TEXT NOT NULL,
  assessment_version      TEXT NOT NULL DEFAULT 'v1.0',
  overall_profile_summary JSONB,
  session_duration_ms     INTEGER,
  data_quality_grade      TEXT NOT NULL DEFAULT 'high' CHECK (data_quality_grade IN ('high', 'moderate', 'limited_evidence')),
  is_completed            BOOLEAN NOT NULL DEFAULT false,
  is_interrupted          BOOLEAN NOT NULL DEFAULT false,
  started_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at            TIMESTAMPTZ
);

ALTER TABLE assessment_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "parents can manage their children's assessment sessions"
  ON assessment_sessions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM children c
      WHERE c.id = assessment_sessions.child_id
        AND c.parent_id = auth.uid()
    )
  );

-- ── 2. Item-Level Raw Telemetry ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS assessment_responses (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id             UUID NOT NULL REFERENCES assessment_sessions(id) ON DELETE CASCADE,
  domain                 TEXT NOT NULL,
  task_type              TEXT NOT NULL,
  item_id                TEXT NOT NULL,
  difficulty_tier        TEXT NOT NULL CHECK (difficulty_tier IN ('easy', 'medium', 'hard')),
  is_practice_item       BOOLEAN NOT NULL DEFAULT false,
  presented_content      JSONB NOT NULL,
  expected_answer        TEXT NOT NULL,
  selected_answer        TEXT,
  is_correct             BOOLEAN NOT NULL,
  response_time_ms       INTEGER NOT NULL,
  attempt_count          SMALLINT NOT NULL DEFAULT 1,
  audio_replay_count     SMALLINT NOT NULL DEFAULT 0,
  was_skipped            BOOLEAN NOT NULL DEFAULT false,
  accidental_touch_flag  BOOLEAN NOT NULL DEFAULT false,
  error_classification   TEXT,
  recorded_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE assessment_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "parents can view assessment responses"
  ON assessment_responses
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM assessment_sessions s
      JOIN children c ON c.id = s.child_id
      WHERE s.id = assessment_responses.session_id
        AND c.parent_id = auth.uid()
    )
  );

-- ── 3. Domain Performance Scores ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS assessment_domain_scores (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id              UUID NOT NULL REFERENCES assessment_sessions(id) ON DELETE CASCADE,
  domain_id               TEXT NOT NULL,
  domain_name             TEXT NOT NULL,
  accuracy_percentage     NUMERIC(5,2) NOT NULL,
  median_response_time_ms INTEGER NOT NULL,
  mean_response_time_ms   INTEGER NOT NULL,
  latency_cv              NUMERIC(4,2),
  total_scored_items      SMALLINT NOT NULL,
  correct_items           SMALLINT NOT NULL,
  difficulty_reached      TEXT NOT NULL CHECK (difficulty_reached IN ('easy', 'medium', 'hard')),
  support_level           TEXT NOT NULL CHECK (support_level IN ('level_1', 'level_2', 'level_3', 'level_4')),
  evidence_quality        TEXT NOT NULL DEFAULT 'high' CHECK (evidence_quality IN ('high', 'moderate', 'limited_evidence')),
  error_patterns          JSONB,
  calculated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE assessment_domain_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "parents can view assessment domain scores"
  ON assessment_domain_scores
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM assessment_sessions s
      JOIN children c ON c.id = s.child_id
      WHERE s.id = assessment_domain_scores.session_id
        AND c.parent_id = auth.uid()
    )
  );

-- ── 4. Personalization Profiles & Learning Paths ──────────────────────────────
CREATE TABLE IF NOT EXISTS personalization_profiles (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id               UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  assessment_session_id  UUID REFERENCES assessment_sessions(id) ON DELETE SET NULL,
  domain_support_levels  JSONB NOT NULL,
  recommended_graphemes  TEXT[] NOT NULL DEFAULT '{}',
  priority_learning_path TEXT NOT NULL,
  -- NOTE: haptic_tolerance_px intentionally NOT stored here.
  -- Motor/haptic performance is a separate signal from reading assessment results.
  -- Tracing difficulty parameters are managed exclusively by the haptic module.
  learning_activities    JSONB NOT NULL DEFAULT '[]',
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE personalization_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "parents can manage personalization profiles"
  ON personalization_profiles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM children c
      WHERE c.id = personalization_profiles.child_id
        AND c.parent_id = auth.uid()
    )
  );

-- ── Indexes ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_assessment_sessions_child ON assessment_sessions(child_id);
CREATE INDEX IF NOT EXISTS idx_assessment_responses_session ON assessment_responses(session_id);
CREATE INDEX IF NOT EXISTS idx_domain_scores_session ON assessment_domain_scores(session_id);
CREATE INDEX IF NOT EXISTS idx_personalization_child ON personalization_profiles(child_id);
