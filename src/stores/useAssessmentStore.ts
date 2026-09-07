/**
 * useAssessmentStore — Zustand store for psychometric reading assessment
 *
 * Manages:
 * - Active assessment session lifecycle
 * - Stage progression (Stages 00–10 + Break)
 * - Practice mode state per task
 * - Item-level telemetry & audio replay counts
 * - Offline sync to Supabase / IndexedDB outbox
 */

import { create } from 'zustand';
import { supabase, type DbChild, type DbAssessmentSession } from '@/lib/supabase';
import { queueSession } from '@/lib/offlineOutbox';

export interface AssessmentResponseItem {
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
  reset: () => void;
}

export const useAssessmentStore = create<AssessmentState>((set, get) => ({
  sessionId: null,
  currentStageIndex: 0,
  isPracticeActive: true,
  activeLanguage: 'en-US',
  itemResponses: [],
  domainScores: {},
  isSessionActive: false,
  isInterrupted: false,
  sessionStartTime: null,
  audioReplaysInCurrentItem: 0,

  startAssessment: async (_child, language = 'en-US') => {
    const newSessionId = crypto.randomUUID();
    set({
      sessionId: newSessionId,
      currentStageIndex: 0,
      isPracticeActive: true,
      activeLanguage: language,
      itemResponses: [],
      domainScores: {},
      isSessionActive: true,
      isInterrupted: false,
      sessionStartTime: Date.now(),
      audioReplaysInCurrentItem: 0,
    });
    return newSessionId;
  },

  incrementAudioReplay: () => set(s => ({ audioReplaysInCurrentItem: s.audioReplaysInCurrentItem + 1 })),
  
  setPracticeMode: (isPractice) => set({ isPracticeActive: isPractice, audioReplaysInCurrentItem: 0 }),

  recordResponse: (payload) => {
    const audioReplays = get().audioReplaysInCurrentItem;
    const fullPayload: AssessmentResponseItem = {
      ...payload,
      audio_replay_count: audioReplays,
    };
    set(s => ({
      itemResponses: [...s.itemResponses, fullPayload],
      audioReplaysInCurrentItem: 0,
    }));
  },

  advanceStage: () => set(s => ({ currentStageIndex: s.currentStageIndex + 1, isPracticeActive: true })),

  finishAssessment: async (child, overallSummary) => {
    const { sessionId, sessionStartTime, activeLanguage } = get();
    const durationMs = sessionStartTime ? Date.now() - sessionStartTime : undefined;

    const sessionRecord: DbAssessmentSession = {
      id: sessionId!,
      child_id: child.id,
      assessment_language: activeLanguage,
      age_band: child.age_band,
      grade_level: 'Grade 2',
      assessment_version: 'v1.0',
      overall_profile_summary: overallSummary || null,
      session_duration_ms: durationMs,
      data_quality_grade: 'high',
      is_completed: true,
      is_interrupted: false,
      started_at: new Date(sessionStartTime ?? Date.now()).toISOString(),
      completed_at: new Date().toISOString(),
    };

    if (!supabase) {
      await queueSession(sessionRecord as never);
      return;
    }

    const { error } = await supabase.from('assessment_sessions').insert(sessionRecord as never);
    if (error) {
      console.warn('[LyraLearn] Assessment session sync failed, queuing offline:', error.message);
      await queueSession(sessionRecord as never);
    }
  },

  reset: () => set({
    sessionId: null,
    currentStageIndex: 0,
    isPracticeActive: true,
    itemResponses: [],
    domainScores: {},
    isSessionActive: false,
    isInterrupted: false,
    sessionStartTime: null,
    audioReplaysInCurrentItem: 0,
  }),
}));
