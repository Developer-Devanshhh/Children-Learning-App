/**
 * adaptiveEngine.ts — Centralized Adaptive Assessment Engine & Minimum Item Rules
 *
 * Requirements:
 *   1. Minimum 4 SCORED items required before adaptive ceiling/floor termination can occur.
 *   2. Practice items (isPractice === true) never count toward scored items or adaptive triggers.
 *   3. Skipped responses (was_skipped === true) are recorded as telemetry but do not count as valid scored responses for adaptive stopping rules.
 *   4. Accidental taps (< 300ms) are flagged and do not count toward valid scored accuracy metrics.
 *   5. Configurable thresholds (PROVISIONAL - not norm-referenced).
 */

import type { AssessmentCorpusItem } from '@/data/assessmentCorpus';

export interface AdaptiveConfig {
  minScoredItems: number;
  consecutiveCorrectForHard: number;
  consecutiveIncorrectForEasy: number;
  ceilingConsecutiveHard: number;
  floorConsecutiveEasy: number;
  accidentalTouchThresholdMs: number;
}

export const DEFAULT_ADAPTIVE_CONFIG: AdaptiveConfig = {
  minScoredItems: 4,
  consecutiveCorrectForHard: 2,
  consecutiveIncorrectForEasy: 2,
  ceilingConsecutiveHard: 3,
  floorConsecutiveEasy: 3,
  accidentalTouchThresholdMs: 300,
};

export interface AdaptiveEvaluationInput {
  isPractice: boolean;
  isCorrect: boolean;
  isSkipped: boolean;
  responseTimeMs: number;
  currentTier: 'easy' | 'medium' | 'hard';
  consecutiveCorrect: number;
  consecutiveIncorrect: number;
  validScoredCount: number;
  config?: AdaptiveConfig;
}

export interface AdaptiveEvaluationResult {
  nextConsecutiveCorrect: number;
  nextConsecutiveIncorrect: number;
  nextValidScoredCount: number;
  shouldEscalateToHard: boolean;
  shouldBranchToEasy: boolean;
  isCeilingMet: boolean;
  isFloorMet: boolean;
  shouldTerminateStage: boolean;
  isAccidentalTap: boolean;
}

export function evaluateAdaptiveStep(input: AdaptiveEvaluationInput): AdaptiveEvaluationResult {
  const config = input.config ?? DEFAULT_ADAPTIVE_CONFIG;
  const isAccidentalTap = input.responseTimeMs < config.accidentalTouchThresholdMs;

  // Practice items and skipped items do not modify scored counters
  if (input.isPractice || input.isSkipped || isAccidentalTap) {
    return {
      nextConsecutiveCorrect: input.consecutiveCorrect,
      nextConsecutiveIncorrect: input.consecutiveIncorrect,
      nextValidScoredCount: input.validScoredCount,
      shouldEscalateToHard: false,
      shouldBranchToEasy: false,
      isCeilingMet: false,
      isFloorMet: false,
      shouldTerminateStage: false,
      isAccidentalTap,
    };
  }

  // Valid scored response
  const nextValidScoredCount = input.validScoredCount + 1;
  let nextConsecutiveCorrect = input.consecutiveCorrect;
  let nextConsecutiveIncorrect = input.consecutiveIncorrect;

  if (input.isCorrect) {
    nextConsecutiveCorrect += 1;
    nextConsecutiveIncorrect = 0;
  } else {
    nextConsecutiveIncorrect += 1;
    nextConsecutiveCorrect = 0;
  }

  // Promotion / Branching triggers
  const shouldEscalateToHard = nextConsecutiveCorrect >= config.consecutiveCorrectForHard && input.currentTier !== 'hard';
  const shouldBranchToEasy = nextConsecutiveIncorrect >= config.consecutiveIncorrectForEasy && input.currentTier !== 'easy';

  // Ceiling and Floor rules — strictly require minimum scored items
  const hasMetMinItems = nextValidScoredCount >= config.minScoredItems;
  const isCeilingMet = hasMetMinItems && input.currentTier === 'hard' && nextConsecutiveCorrect >= config.ceilingConsecutiveHard;
  const isFloorMet = hasMetMinItems && input.currentTier === 'easy' && nextConsecutiveIncorrect >= config.floorConsecutiveEasy;

  const shouldTerminateStage = isCeilingMet || isFloorMet;

  return {
    nextConsecutiveCorrect,
    nextConsecutiveIncorrect,
    nextValidScoredCount,
    shouldEscalateToHard,
    shouldBranchToEasy,
    isCeilingMet,
    isFloorMet,
    shouldTerminateStage,
    isAccidentalTap,
  };
}

/**
 * Ensures the adaptive queue contains enough remaining candidate items to satisfy minScoredItems.
 */
export function ensureQueueSufficiency(
  currentQueue: AssessmentCorpusItem[],
  allItemsForStage: AssessmentCorpusItem[],
  targetTier?: 'easy' | 'medium' | 'hard'
): AssessmentCorpusItem[] {
  if (targetTier) {
    const tierItems = allItemsForStage.filter((i) => !i.isPractice && i.difficultyTier === targetTier);
    const missingItems = tierItems.filter((item) => !currentQueue.some((q) => q.id === item.id));
    return [...currentQueue, ...missingItems];
  }
  return currentQueue;
}
