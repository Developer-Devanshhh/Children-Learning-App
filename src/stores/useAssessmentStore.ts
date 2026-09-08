/**
 * useAssessmentStore — Zustand store for psychometric reading assessment
 *
 * Manages:
 * - Active assessment session lifecycle
 * - Stage progression (Stages 00–10 + Break)
 * - Practice mode state per task
 * - Item-level telemetry & audio replay counts
 * - Per-item immediate offline persistence to IndexedDB / Supabase
 * - Dynamic data quality evaluation & child grade propagation
 */

import { create } from 'zustand';
import { supabase, type DbChild, type DbAssessmentSession, type DbAssessmentResponse } from '@/lib/supabase';
import {
  queueRecord,
  saveAssessmentRecoverySnapshot,
  clearAssessmentRecoverySnapshot,
  getAssessmentRecoverySnapshot,
} from '@/lib/offlineOutbox';

export interface AssessmentResponseItem {
  response_id?: string;
  session_id?: string;
  child_id?: string;
  age_band?: string;
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

export interface DomainScoreSummary {
  domain_id: string;
  domain_name: string;
  accuracy_percentage: number;
  median_response_time_ms: number;
  mean_response_time_ms: number;
  latency_cv: number;
  total_scored_items: number;
  correct_items: number;
  difficulty_reached: 'easy' | 'medium' | 'hard';
  support_level: 'level_1' | 'level_2' | 'level_3' | 'level_4';
  evidence_quality: 'high' | 'moderate' | 'limited_evidence';
  error_patterns: Record<string, number>;
}

interface AssessmentState {
  sessionId: string | null;
  activeChild: DbChild | null;
  currentStageIndex: number;
  isPracticeActive: boolean;
  activeLanguage: string;
  itemResponses: AssessmentResponseItem[];
  domainScores: Record<string, DomainScoreSummary>;
  isSessionActive: boolean;
  isInterrupted: boolean;
  sessionStartTime: number | null;
  audioReplaysInCurrentItem: number;

  startAssessment: (child: DbChild, language?: string) => Promise<string>;
  recordResponse: (payload: Omit<AssessmentResponseItem, 'audio_replay_count'>) => void;
  incrementAudioReplay: () => void;
  setPracticeMode: (isPractice: boolean) => void;
  advanceStage: () => void;
  finishAssessment: (child: DbChild, overallSummary?: Record<string, unknown>) => Promise<void>;
  restoreSessionFromRecovery: () => Promise<boolean>;
  reset: () => void;
}

export const useAssessmentStore = create<AssessmentState>((set, get) => ({
  sessionId: null,
  activeChild: null,
  currentStageIndex: 0,
  isPracticeActive: true,
  activeLanguage: 'en-US',
  itemResponses: [],
  domainScores: {},
  isSessionActive: false,
  isInterrupted: false,
  sessionStartTime: null,
  audioReplaysInCurrentItem: 0,

  startAssessment: async (child, language = 'en-US') => {
    const newSessionId = crypto.randomUUID();
    const now = Date.now();
    const newState = {
      sessionId: newSessionId,
      activeChild: child,
      currentStageIndex: 0,
      isPracticeActive: true,
      activeLanguage: language,
      itemResponses: [],
      domainScores: {},
      isSessionActive: true,
      isInterrupted: false,
      sessionStartTime: now,
      audioReplaysInCurrentItem: 0,
    };
    set(newState);

    // Save initial recovery snapshot
    void saveAssessmentRecoverySnapshot(newState);

    return newSessionId;
  },

  incrementAudioReplay: () => set((s) => ({ audioReplaysInCurrentItem: s.audioReplaysInCurrentItem + 1 })),

  setPracticeMode: (isPractice) => set({ isPracticeActive: isPractice, audioReplaysInCurrentItem: 0 }),

  recordResponse: (payload) => {
    const { sessionId, activeChild, audioReplaysInCurrentItem, itemResponses, currentStageIndex } = get();
    const nowIso = new Date().toISOString();
    const responseId = `resp_${sessionId ?? 'local'}_${payload.item_id}_${payload.attempt_count}`;

    const fullPayload: AssessmentResponseItem = {
      ...payload,
      response_id: responseId,
      session_id: sessionId ?? undefined,
      child_id: activeChild?.id ?? undefined,
      age_band: activeChild?.age_band ?? undefined,
      audio_replay_count: audioReplaysInCurrentItem,
      recorded_at: nowIso,
    };

    const updatedResponses = [...itemResponses, fullPayload];

    set({
      itemResponses: updatedResponses,
      audioReplaysInCurrentItem: 0,
    });

    // ── Immediate Per-Item Persistence (TASK 2) ───────────────────────────
    const dbRecord: DbAssessmentResponse = {
      session_id: sessionId ?? crypto.randomUUID(),
      domain: fullPayload.domain,
      task_type: fullPayload.task_type,
      item_id: fullPayload.item_id,
      difficulty_tier: fullPayload.difficulty_tier,
      is_practice_item: fullPayload.is_practice_item,
      presented_content: fullPayload.presented_content,
      expected_answer: fullPayload.expected_answer,
      selected_answer: fullPayload.selected_answer,
      is_correct: fullPayload.is_correct,
      response_time_ms: fullPayload.response_time_ms,
      attempt_count: fullPayload.attempt_count,
      audio_replay_count: fullPayload.audio_replay_count,
      was_skipped: fullPayload.was_skipped,
      accidental_touch_flag: fullPayload.accidental_touch_flag,
      error_classification: fullPayload.error_classification ?? null,
      recorded_at: nowIso,
    };

    // Queue response record with idempotent key to prevent duplicates
    void queueRecord('assessment_responses', dbRecord, responseId);

    // If online with Supabase available, attempt direct insert
    if (supabase && sessionId) {
      void supabase
        .from('assessment_responses')
        .insert(dbRecord as never)
        .then(({ error }) => {
          if (error && error.code !== '23505') {
            console.warn('[LyraLearn] Direct response insert failed, retained in outbox:', error.message);
          }
        });
    }

    // Save recovery snapshot after each response
    void saveAssessmentRecoverySnapshot({
      sessionId,
      activeChild,
      currentStageIndex,
      itemResponses: updatedResponses,
      sessionStartTime: get().sessionStartTime,
      isSessionActive: true,
    });
  },

  advanceStage: () => {
    const nextStage = get().currentStageIndex + 1;
    set({ currentStageIndex: nextStage, isPracticeActive: true });

    void saveAssessmentRecoverySnapshot({
      sessionId: get().sessionId,
      activeChild: get().activeChild,
      currentStageIndex: nextStage,
      itemResponses: get().itemResponses,
      sessionStartTime: get().sessionStartTime,
      isSessionActive: true,
    });
  },

  finishAssessment: async (child, overallSummary) => {
    const { sessionId, sessionStartTime, activeLanguage, itemResponses } = get();
    const durationMs = sessionStartTime ? Date.now() - sessionStartTime : undefined;

    // ── TASK 3: Gracefully retrieve actual child's stored grade ───────────
    const childWithGrade = child as DbChild & { grade_level?: string; grade?: string };
    const resolvedGrade = childWithGrade.grade_level || childWithGrade.grade || (child.age_band ? `Age ${child.age_band}` : 'Unspecified');

    // Dynamic Data Quality Grade computation
    const totalResponses = itemResponses.length;
    const skippedCount = itemResponses.filter((r) => r.was_skipped).length;
    const accidentalCount = itemResponses.filter((r) => r.accidental_touch_flag).length;
    const invalidRatio = totalResponses > 0 ? (skippedCount + accidentalCount) / totalResponses : 0;

    let computedQuality: 'high' | 'moderate' | 'limited_evidence' = 'high';
    if (invalidRatio > 0.30) {
      computedQuality = 'limited_evidence';
    } else if (invalidRatio > 0.15) {
      computedQuality = 'moderate';
    }

    const sessionRecord: DbAssessmentSession = {
      id: sessionId!,
      child_id: child.id,
      assessment_language: activeLanguage,
      age_band: child.age_band,
      grade_level: resolvedGrade,
      assessment_version: 'v1.0',
      overall_profile_summary: overallSummary || null,
      session_duration_ms: durationMs,
      data_quality_grade: computedQuality,
      is_completed: true,
      is_interrupted: false,
      started_at: new Date(sessionStartTime ?? Date.now()).toISOString(),
      completed_at: new Date().toISOString(),
    };

    // Queue session record with idempotent ID
    void queueRecord('assessment_sessions', sessionRecord, `sess_${sessionId}`);

    if (supabase) {
      const { error } = await supabase.from('assessment_sessions').insert(sessionRecord as never);
      if (error && error.code !== '23505') {
        console.warn('[LyraLearn] Assessment session sync failed, queued in outbox:', error.message);
      }
    }

    // Clear active recovery snapshot upon successful completion
    await clearAssessmentRecoverySnapshot();
  },

  restoreSessionFromRecovery: async () => {
    const recovery = await getAssessmentRecoverySnapshot();
    if (!recovery || !recovery.state) return false;

    const s = recovery.state as Partial<AssessmentState>;
    if (s.sessionId && s.isSessionActive) {
      set({
        sessionId: s.sessionId,
        activeChild: s.activeChild ?? null,
        currentStageIndex: s.currentStageIndex ?? 0,
        itemResponses: s.itemResponses ?? [],
        sessionStartTime: s.sessionStartTime ?? Date.now(),
        isSessionActive: true,
      });
      return true;
    }
    return false;
  },

  reset: () => {
    void clearAssessmentRecoverySnapshot();
    set({
      sessionId: null,
      activeChild: null,
      currentStageIndex: 0,
      isPracticeActive: true,
      itemResponses: [],
      domainScores: {},
      isSessionActive: false,
      isInterrupted: false,
      sessionStartTime: null,
      audioReplaysInCurrentItem: 0,
    });
  },
}));
