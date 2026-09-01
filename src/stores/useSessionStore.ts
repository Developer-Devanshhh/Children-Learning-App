/**
 * useSessionStore — tracks per-session metadata & logs to Supabase
 *
 * State:
 *   attemptMap   — grapheme_id → attempt index (how many times this session)
 *   guideCount   — how many times guide was replayed in current attempt
 *   sessionStart — timestamp when current attempt started
 *
 * Actions:
 *   startAttempt   — reset guide count, record start time
 *   incrementGuide — guide was replayed
 *   logSession     — write to Supabase (or offline outbox on failure)
 */

import { create } from 'zustand';
import { supabase, type DbTracingSession } from '@/lib/supabase';
import { queueSession } from '@/lib/offlineOutbox';
import type { DbChild } from '@/lib/supabase';

interface SessionState {
  attemptMap: Record<string, number>;  // grapheme_id → attempt count
  guideCount: number;
  sessionStart: number | null;

  startAttempt: (graphemeId: string) => void;
  incrementGuide: () => void;
  logSession: (
    child: DbChild,
    payload: Omit<DbTracingSession, 'child_id' | 'age_band' | 'attempt_index' | 'guide_playback_count' | 'started_at' | 'session_duration_ms'>
  ) => Promise<void>;
  reset: () => void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  attemptMap: {},
  guideCount: 1,
  sessionStart: null,

  startAttempt: (graphemeId) => {
    const prev = get().attemptMap[graphemeId] ?? 0;
    set((s) => ({
      attemptMap: { ...s.attemptMap, [graphemeId]: prev + 1 },
      guideCount: 1,
      sessionStart: Date.now(),
    }));
  },

  incrementGuide: () => set((s) => ({ guideCount: s.guideCount + 1 })),

  logSession: async (child, payload) => {
    const { attemptMap, guideCount, sessionStart } = get();
    const durationMs = sessionStart ? Date.now() - sessionStart : undefined;
    const attemptIndex = attemptMap[payload.grapheme_id] ?? 1;

    const record: DbTracingSession = {
      ...payload,
      child_id: child.id,
      age_band: child.age_band,
      attempt_index: attemptIndex,
      guide_playback_count: guideCount,
      session_duration_ms: durationMs,
      started_at: new Date(sessionStart ?? Date.now()).toISOString(),
    };

    if (!supabase) {
      await queueSession(record);
      return;
    }

    const { error } = await supabase.from('tracing_sessions').insert(record as never);
    if (error) {
      console.warn('[LyraLearn] Session sync failed, queuing offline:', error.message);
      await queueSession(record);
    }
  },

  reset: () => set({ attemptMap: {}, guideCount: 1, sessionStart: null }),
}));
