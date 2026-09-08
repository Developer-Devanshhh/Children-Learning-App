/**
 * shuffleOptions.ts — Deterministic & Balanced Option Placement
 *
 * Ensures multiple-choice options are never consistently fixed in position 0.
 * Distributes correct answers across all positions for unbiased psychometric assessment.
 */

import type { AssessmentCorpusItem } from '@/data/assessmentCorpus';

/**
 * Deterministically pseudo-shuffles options based on item ID so the order
 * is consistent across renders of the same item but varied across items.
 */
export function getBalancedOptions(item: AssessmentCorpusItem): AssessmentCorpusItem['options'] {
  if (!item.options || item.options.length <= 1) return item.options;

  // Simple string hash to generate a stable seed per item
  let seed = 0;
  for (let i = 0; i < item.id.length; i++) {
    seed = (seed * 31 + item.id.charCodeAt(i)) % 1000;
  }

  // Fisher-Yates deterministic shuffle based on seed
  const shuffled = [...item.options];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = (seed + i * 17) % (i + 1);
    const temp = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = temp;
  }

  return shuffled;
}
