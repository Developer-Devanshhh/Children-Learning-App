/**
 * psychometricScorer.ts — Multidimensional Psychometric Screening & Scoring Engine
 *
 * Principles:
 *   1. Multidimensional Profile: Evaluates 10 independent cognitive & literacy domains.
 *      NO single "dyslexia score" or clinical diagnostic label is ever generated.
 *   2. Support Levels: Level 1 (Advanced Mastery), Level 2 (Age-Appropriate / Solid),
 *      Level 3 (Targeted Practice), Level 4 (Intensive Multi-Sensory Scaffolding).
 *   3. Speed & Accuracy Separation: Accuracy (%) and Latency (mean, median, CV) are scored
 *      as independent metrics.
 *   4. Quality & Evidence Guard: Evaluates validity based on valid response counts and skip/error rates.
 *   5. Personalization Generation: Generates prioritized learning paths and recommended graphemes
 *      for the learning app modules (without coupling to motor/haptic parameters).
 */

import type { AssessmentResponseItem, DomainScoreSummary } from '@/stores/useAssessmentStore';
import type { DbPersonalizationProfile } from '@/lib/supabase';

export interface DomainMetadata {
  id: string;
  name: string;
  category: 'literacy_foundations' | 'advanced_reading' | 'cognitive_executive';
  description: string;
}

export const DOMAIN_METADATA: Record<string, DomainMetadata> = {
  letter_knowledge: {
    id: 'letter_knowledge',
    name: 'Letter Knowledge & Sound Mapping',
    category: 'literacy_foundations',
    description: 'Letter identification, uppercase/lowercase matching, and letter-sound correspondence.',
  },
  phonological_awareness: {
    id: 'phonological_awareness',
    name: 'Phonological Awareness',
    category: 'literacy_foundations',
    description: 'Auditory manipulation of spoken sounds: rhyme, initial/final sounds, blending, and deletion.',
  },
  decoding: {
    id: 'decoding',
    name: 'Phonological Decoding',
    category: 'literacy_foundations',
    description: 'Sublexical grapheme-phoneme conversion using phonotactically legal nonwords.',
  },
  word_recognition: {
    id: 'word_recognition',
    name: 'Sight Word & Lexical Recognition',
    category: 'literacy_foundations',
    description: 'Direct lexical access and orthographic retrieval of high-frequency regular and irregular words.',
  },
  reading_fluency: {
    id: 'reading_fluency',
    name: 'Sentence Reading Fluency',
    category: 'advanced_reading',
    description: 'Automaticity in decoding, syntactic parsing, and semantic sentence verification.',
  },
  reading_comprehension: {
    id: 'reading_comprehension',
    name: 'Reading Comprehension',
    category: 'advanced_reading',
    description: 'Text-level narrative understanding, literal recall, and contextual inference.',
  },
  spelling: {
    id: 'spelling',
    name: 'Spelling & Orthographic Memory',
    category: 'advanced_reading',
    description: 'Visual word-form precision and phoneme-to-grapheme encoding.',
  },
  rapid_naming: {
    id: 'rapid_naming',
    name: 'Rapid Automatized Naming (RAN)',
    category: 'cognitive_executive',
    description: 'Visual-verbal processing speed and automatic lexical retrieval.',
  },
  working_memory: {
    id: 'working_memory',
    name: 'Working Memory Capacity',
    category: 'cognitive_executive',
    description: 'Short-term phonological storage (forward span) and executive mental manipulation (backward span).',
  },
  attention_processing_speed: {
    id: 'attention_processing_speed',
    name: 'Attention & Processing Speed',
    category: 'cognitive_executive',
    description: 'Selective visual search, focus consistency, and inhibitory control against flankers.',
  },
};

export interface MultidimensionalAssessmentResult {
  domainScores: Record<string, DomainScoreSummary>;
  overallProfileSummary: {
    strongestDomains: string[];
    growthAreas: string[];
    dataQualityGrade: 'high' | 'moderate' | 'limited_evidence';
    totalScoredResponses: number;
    completionTimestamp: string;
  };
  personalizationProfile: Omit<DbPersonalizationProfile, 'id' | 'child_id' | 'assessment_session_id'>;
}

/**
 * Calculates domain scores and personalization recommendations from raw item responses.
 */
export function scoreAssessmentSession(
  responses: AssessmentResponseItem[],
  childAgeBand: string
): MultidimensionalAssessmentResult {
  const scoredItems = responses.filter((r) => !r.is_practice_item);
  const domainScores: Record<string, DomainScoreSummary> = {};
  const errorBreakdownByDomain: Record<string, Record<string, number>> = {};

  // Group responses by domain
  const responsesByDomain: Record<string, AssessmentResponseItem[]> = {};
  for (const domainKey of Object.keys(DOMAIN_METADATA)) {
    responsesByDomain[domainKey] = [];
    errorBreakdownByDomain[domainKey] = {};
  }

  for (const item of scoredItems) {
    if (!responsesByDomain[item.domain]) {
      responsesByDomain[item.domain] = [];
      errorBreakdownByDomain[item.domain] = {};
    }
    responsesByDomain[item.domain].push(item);

    if (item.error_classification) {
      const count = errorBreakdownByDomain[item.domain][item.error_classification] || 0;
      errorBreakdownByDomain[item.domain][item.error_classification] = count + 1;
    }
  }

  // Calculate scores per domain
  for (const [domainKey, domainItems] of Object.entries(responsesByDomain)) {
    const meta = DOMAIN_METADATA[domainKey] ?? {
      id: domainKey,
      name: domainKey,
      category: 'literacy_foundations',
      description: '',
    };

    const validItems = domainItems.filter((i) => !i.was_skipped && !i.accidental_touch_flag);
    const totalCount = domainItems.length;
    const validCount = validItems.length;
    const correctCount = validItems.filter((i) => i.is_correct).length;

    const accuracy = validCount > 0 ? Math.round((correctCount / validCount) * 100) : 0;

    // Latency statistics
    const latencies = validItems.map((i) => i.response_time_ms).sort((a, b) => a - b);
    const meanLatency = latencies.length > 0 ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : 0;
    const medianLatency = latencies.length > 0 ? latencies[Math.floor(latencies.length / 2)] : 0;

    // Coefficient of variation (CV = standard deviation / mean)
    let latencyCv = 0;
    if (latencies.length > 1 && meanLatency > 0) {
      const variance = latencies.reduce((acc, val) => acc + Math.pow(val - meanLatency, 2), 0) / latencies.length;
      latencyCv = Number((Math.sqrt(variance) / meanLatency).toFixed(2));
    }

    // Determine highest difficulty reached in scored responses
    let difficultyReached: 'easy' | 'medium' | 'hard' = 'medium';
    if (validItems.some((i) => i.difficulty_tier === 'hard')) {
      difficultyReached = 'hard';
    } else if (validItems.every((i) => i.difficulty_tier === 'easy') && validItems.length > 0) {
      difficultyReached = 'easy';
    }

    // Determine Support Level (PROVISIONAL research-grounded thresholds)
    let supportLevel: 'level_1' | 'level_2' | 'level_3' | 'level_4' = 'level_2';
    if (accuracy >= 85 && difficultyReached === 'hard') {
      supportLevel = 'level_1'; // Advanced / Independent
    } else if (accuracy >= 65) {
      supportLevel = 'level_2'; // Core / Age-Appropriate
    } else if (accuracy >= 45) {
      supportLevel = 'level_3'; // Targeted Practice Needed
    } else {
      supportLevel = 'level_4'; // Intensive Scaffolding & Multi-Sensory Support
    }

    // Data evidence quality calculation
    const skipCount = domainItems.filter((i) => i.was_skipped).length;
    const accidentalCount = domainItems.filter((i) => i.accidental_touch_flag).length;
    let evidenceQuality: 'high' | 'moderate' | 'limited_evidence' = 'high';

    if (validCount < 3 || (totalCount > 0 && (skipCount + accidentalCount) / totalCount > 0.35)) {
      evidenceQuality = 'limited_evidence';
    } else if (validCount < 4 || (totalCount > 0 && (skipCount + accidentalCount) / totalCount > 0.18)) {
      evidenceQuality = 'moderate';
    }

    domainScores[domainKey] = {
      domain_id: domainKey,
      domain_name: meta.name,
      accuracy_percentage: accuracy,
      median_response_time_ms: medianLatency,
      mean_response_time_ms: meanLatency,
      latency_cv: latencyCv,
      total_scored_items: totalCount,
      correct_items: correctCount,
      difficulty_reached: difficultyReached,
      support_level: supportLevel,
      evidence_quality: evidenceQuality,
      error_patterns: errorBreakdownByDomain[domainKey] || {},
    };
  }

  // Identify strengths & growth areas for summary
  const sortedDomains = Object.values(domainScores).sort((a, b) => b.accuracy_percentage - a.accuracy_percentage);
  const strongestDomains = sortedDomains.slice(0, 3).map((d) => d.domain_name);
  const growthAreas = sortedDomains
    .filter((d) => d.support_level === 'level_3' || d.support_level === 'level_4')
    .map((d) => d.domain_name);

  // Overall data quality grade across all domains
  const allValidCount = scoredItems.filter((r) => !r.was_skipped && !r.accidental_touch_flag).length;
  const overallQuality: 'high' | 'moderate' | 'limited_evidence' =
    allValidCount >= 30 ? 'high' : allValidCount >= 18 ? 'moderate' : 'limited_evidence';

  // ── Personalization Profile Generation ──────────────────────────────────
  // Recommends target graphemes, words, and learning pathways (WITHOUT coupling to motor/haptic parameters)
  const domainSupportMap: Record<string, 'level_1' | 'level_2' | 'level_3' | 'level_4'> = {};
  for (const [k, v] of Object.entries(domainScores)) {
    domainSupportMap[k] = v.support_level;
  }

  // Determine recommended graphemes based on error tags & sound knowledge
  const recommendedGraphemes: string[] = [];
  const letterErrors = domainScores.letter_knowledge?.error_patterns || {};
  const decodingErrors = domainScores.decoding?.error_patterns || {};

  if (letterErrors['ORTHOGRAPHIC_REVERSAL_OBSERVATION'] || decodingErrors['REVERSAL_CONFUSION_OBSERVATION']) {
    recommendedGraphemes.push('b', 'd', 'p', 'q');
  }
  if (letterErrors['VISUAL_INVERSION_OBSERVATION'] || letterErrors['ORTHOGRAPHIC_SIMILAR']) {
    recommendedGraphemes.push('m', 'w', 'n');
  }
  if (recommendedGraphemes.length === 0) {
    recommendedGraphemes.push('s', 'a', 't', 'p', 'i', 'n');
  }

  // Priority Learning Pathway
  let priorityPath = 'Multi-Sensory Alphabet & Phonics Adventure';
  if (domainSupportMap.phonological_awareness === 'level_4' || domainSupportMap.phonological_awareness === 'level_3') {
    priorityPath = 'Sound Explorer: Auditory Rhyme & Phoneme Blending Journey';
  } else if (domainSupportMap.decoding === 'level_4' || domainSupportMap.decoding === 'level_3') {
    priorityPath = 'Alien Word Decoder: Structured GPC Phonics Practice';
  } else if (domainSupportMap.reading_fluency === 'level_4' || domainSupportMap.reading_fluency === 'level_3') {
    priorityPath = 'Fluency Rapids: Connected Sentence Reading & Automaticity';
  } else if (domainSupportMap.working_memory === 'level_4' || domainSupportMap.working_memory === 'level_3') {
    priorityPath = 'Memory Grove: Multi-Sensory Chunking & Sequence Building';
  } else {
    priorityPath = 'Story Master: Creative Reading & Story Adventures';
  }

  const learningActivities = [
    {
      id: 'act_haptic_tracing',
      title: 'Haptic Alphabet Tracing Studio',
      description: 'Practice guided multi-sensory stroke tracing for focus letters: ' + recommendedGraphemes.slice(0, 4).join(', ').toUpperCase(),
      recommendedGraphemes: recommendedGraphemes.slice(0, 4),
      icon: '✍️',
    },
    {
      id: 'act_sound_river',
      title: 'Sound River Blending Games',
      description: 'Interactive audio phoneme blending and sound-isolation puzzles with Lyra.',
      icon: '🌊',
    },
    {
      id: 'act_word_safari',
      title: 'Word Safari Flash Cards',
      description: 'Visual flashcard recognition and sentence puzzles for age band ' + childAgeBand + '.',
      icon: '🦁',
    },
  ];

  return {
    domainScores,
    overallProfileSummary: {
      strongestDomains,
      growthAreas: growthAreas.length > 0 ? growthAreas : ['All domains performing within age-appropriate ranges'],
      dataQualityGrade: overallQuality,
      totalScoredResponses: scoredItems.length,
      completionTimestamp: new Date().toISOString(),
    },
    personalizationProfile: {
      domain_support_levels: domainSupportMap,
      recommended_graphemes: recommendedGraphemes,
      priority_learning_path: priorityPath,
      haptic_tolerance_px: 32, // Default standard tracing tolerance
      learning_activities: learningActivities,
    },
  };
}
