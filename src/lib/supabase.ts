/**
 * supabase.ts — singleton Supabase client
 *
 * Reads VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from env.
 * If missing (during dev before credentials are added), logs a clear
 * warning and exports a null-safe client so the app can still run
 * in offline / no-auth mode.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url  = import.meta.env.VITE_SUPABASE_URL  as string | undefined;
const key  = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!url || !key) {
  console.warn(
    '[LyraLearn] Supabase credentials not found.\n' +
    'Copy .env.local.example → .env.local and fill in your project URL and anon key.\n' +
    'The app will run in offline-only mode until credentials are provided.'
  );
}

// ── Database type helpers ─────────────────────────────────────────────────

export interface DbChild {
  id: string;
  parent_id: string;
  name: string;
  age_band: '6-7' | '8-9' | '10-12';
  avatar_seed: string;
  created_at: string;
}

export interface DbTracingSession {
  id?: string;
  child_id: string;
  grapheme_id: string;
  age_band: string;
  score_overall: number;
  score_coverage: number;
  score_start: number;
  score_stroke_count: number;
  band: 'amazing' | 'great' | 'getting-there' | 'together';
  attempt_index: number;
  guide_playback_count: number;
  raw_stroke_data?: unknown;
  session_duration_ms?: number;
  started_at: string;
}

export interface DbAssessmentSession {
  id?: string;
  child_id: string;
  assessment_language: string;
  age_band: '6-7' | '8-9' | '10-12';
  grade_level: string;
  assessment_version: string;
  overall_profile_summary?: Record<string, unknown> | null;
  session_duration_ms?: number;
  data_quality_grade: 'high' | 'moderate' | 'limited_evidence';
  is_completed: boolean;
  is_interrupted: boolean;
  started_at: string;
  completed_at?: string | null;
}

export interface DbAssessmentResponse {
  id?: string;
  session_id: string;
  domain: string;
  task_type: string;
  item_id: string;
  difficulty_tier: 'easy' | 'medium' | 'hard';
  is_practice_item: boolean;
  presented_content: Record<string, unknown>;
  expected_answer: string;
  selected_answer: string | null;
  is_correct: boolean;
  response_time_ms: number;
  attempt_count: number;
  audio_replay_count: number;
  was_skipped: boolean;
  accidental_touch_flag: boolean;
  error_classification?: string | null;
  recorded_at?: string;
}

export interface DbAssessmentDomainScore {
  id?: string;
  session_id: string;
  domain_id: string;
  domain_name: string;
  accuracy_percentage: number;
  median_response_time_ms: number;
  mean_response_time_ms: number;
  latency_cv?: number | null;
  total_scored_items: number;
  correct_items: number;
  difficulty_reached: 'easy' | 'medium' | 'hard';
  support_level: 'level_1' | 'level_2' | 'level_3' | 'level_4';
  evidence_quality: 'high' | 'moderate' | 'limited_evidence';
  error_patterns?: Record<string, number> | null;
  calculated_at?: string;
}

export interface DbPersonalizationProfile {
  id?: string;
  child_id: string;
  assessment_session_id?: string | null;
  domain_support_levels: Record<string, 'level_1' | 'level_2' | 'level_3' | 'level_4'>;
  recommended_graphemes: string[];
  priority_learning_path: string;
  haptic_tolerance_px: number;
  learning_activities: unknown[];
  updated_at?: string;
}

export interface Database {
  public: {
    Tables: {
      children: {
        Row: DbChild;
        Insert: Omit<DbChild, 'id' | 'created_at'>;
        Update: Partial<Omit<DbChild, 'id' | 'parent_id'>>;
      };
      tracing_sessions: {
        Row: DbTracingSession & { id: string };
        Insert: Omit<DbTracingSession, 'id'>;
        Update: Partial<DbTracingSession>;
      };
      assessment_sessions: {
        Row: DbAssessmentSession & { id: string };
        Insert: Omit<DbAssessmentSession, 'id'>;
        Update: Partial<DbAssessmentSession>;
      };
      assessment_responses: {
        Row: DbAssessmentResponse & { id: string };
        Insert: Omit<DbAssessmentResponse, 'id'>;
        Update: Partial<DbAssessmentResponse>;
      };
      assessment_domain_scores: {
        Row: DbAssessmentDomainScore & { id: string };
        Insert: Omit<DbAssessmentDomainScore, 'id'>;
        Update: Partial<DbAssessmentDomainScore>;
      };
      personalization_profiles: {
        Row: DbPersonalizationProfile & { id: string };
        Insert: Omit<DbPersonalizationProfile, 'id'>;
        Update: Partial<DbPersonalizationProfile>;
      };
    };
  };
}

// ── Export client ─────────────────────────────────────────────────────────

export const supabase: SupabaseClient<Database> | null =
  url && key
    ? createClient<Database>(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      })
    : null;
