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
