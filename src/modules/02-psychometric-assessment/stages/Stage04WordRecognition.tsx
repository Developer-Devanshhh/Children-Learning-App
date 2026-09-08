/**
 * Stage04WordRecognition.tsx — Stage 04: Word Recognition & Sight-Word Screening
 *
 * Measures:
 *   - Direct lexical access and orthographic recognition of real English words
 *   - Distinguishes accurate orthography from phonetically plausible misspellings (e.g. SAID vs SED)
 *   - Tests high-frequency regular & irregular sight words with increasing grade-band complexity
 *
 * Adaptive Logic (Centralized via adaptiveEngine):
 *   - Starts at Medium tier items.
 *   - Minimum 4 scored items required before ceiling/floor rule can terminate.
 *   - 2 consecutive correct -> advances to Hard tier.
 *   - 2 consecutive incorrect -> branches to Easy tier.
 *   - Ceiling rule: 3 consecutive correct at Hard (only after >= 4 valid scored items).
 *   - Floor rule: 3 consecutive incorrect at Easy (only after >= 4 valid scored items).
 *   - Practice items are fully separated and un-scored.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { Volume2, Sparkles, CheckCircle2 } from 'lucide-react';
import { Lyra } from '@/modules/04-attention-agent/Lyra';
import { audioEngine } from '@/modules/audio/audioEngine';
import { STAGE_04_ITEMS, type AssessmentCorpusItem } from '@/data/assessmentCorpus';
import { useAssessmentStore } from '@/stores/useAssessmentStore';
import { evaluateAdaptiveStep, ensureQueueSufficiency, DEFAULT_ADAPTIVE_CONFIG } from '@/lib/adaptiveEngine';

interface Stage04Props {
  onStageComplete: () => void;
  onExit?: () => void;
}

export function Stage04WordRecognition({ onStageComplete }: Stage04Props) {
  const { recordResponse, incrementAudioReplay } = useAssessmentStore();

  const [activeItemIndex, setActiveItemIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isProcessingSelection, setIsProcessingSelection] = useState(false);
  const [activeTier, setActiveTier] = useState<'easy' | 'medium' | 'hard'>('medium');

  // Dynamic adaptive item queue
  const [queue, setQueue] = useState<AssessmentCorpusItem[]>(() => {
    const practice = STAGE_04_ITEMS.find((i) => i.isPractice);
    const scoredMedium = STAGE_04_ITEMS.filter((i) => !i.isPractice && i.difficultyTier === 'medium');
    return practice ? [practice, ...scoredMedium] : scoredMedium;
  });

  const consecutiveCorrectRef = useRef(0);
  const consecutiveIncorrectRef = useRef(0);
  const validScoredCountRef = useRef(0);
  const itemStartTimeRef = useRef<number>(Date.now());
  const attemptsCountRef = useRef<number>(0);

  const currentItem = queue[activeItemIndex] as AssessmentCorpusItem | undefined;

  const playPromptSpeech = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.92;
      utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  // Play audio when a new item is presented
  useEffect(() => {
    if (!currentItem) return;
    itemStartTimeRef.current = Date.now();
    setSelectedOptionId(null);
    setIsProcessingSelection(false);
    attemptsCountRef.current = 0;

    const timer = setTimeout(() => {
      playPromptSpeech(currentItem.audioPromptText);
    }, 300);

    return () => clearTimeout(timer);
  }, [currentItem, playPromptSpeech]);

  const handleReplayAudio = () => {
    if (!currentItem) return;
    incrementAudioReplay();
    audioEngine.playWaypointHit();
    playPromptSpeech(currentItem.audioPromptText);
  };

  const handleSelectOption = (option: AssessmentCorpusItem['options'][0]) => {
    if (!currentItem || isProcessingSelection) return;

    const now = Date.now();
    const latency = now - itemStartTimeRef.current;
    const isAccidentalTap = latency < DEFAULT_ADAPTIVE_CONFIG.accidentalTouchThresholdMs;

    attemptsCountRef.current += 1;
    setSelectedOptionId(option.id);
    setIsProcessingSelection(true);

    if (option.isCorrect) {
      audioEngine.playSuccess();
    } else {
      audioEngine.playEncourage();
    }

    // Record response telemetry (TASK 2)
    recordResponse({
      domain: 'word_recognition',
      task_type: currentItem.taskType,
      item_id: currentItem.id,
      difficulty_tier: currentItem.difficultyTier,
      is_practice_item: currentItem.isPractice,
      presented_content: {
        prompt: currentItem.promptText,
      },
      expected_answer: currentItem.expectedAnswerId,
      selected_answer: option.id,
      is_correct: option.isCorrect,
      response_time_ms: latency,
      attempt_count: attemptsCountRef.current,
      was_skipped: false,
      accidental_touch_flag: isAccidentalTap,
      error_classification: option.errorType ?? null,
    });

    // Centralized adaptive evaluation (TASK 1)
    const evalResult = evaluateAdaptiveStep({
      isPractice: currentItem.isPractice,
      isCorrect: option.isCorrect,
      isSkipped: false,
      responseTimeMs: latency,
      currentTier: activeTier,
      consecutiveCorrect: consecutiveCorrectRef.current,
      consecutiveIncorrect: consecutiveIncorrectRef.current,
      validScoredCount: validScoredCountRef.current,
    });

    validScoredCountRef.current = evalResult.nextValidScoredCount;
    consecutiveCorrectRef.current = evalResult.nextConsecutiveCorrect;
    consecutiveIncorrectRef.current = evalResult.nextConsecutiveIncorrect;

    if (evalResult.shouldEscalateToHard) {
      setQueue((prev) => ensureQueueSufficiency(prev, STAGE_04_ITEMS, 'hard'));
      setActiveTier('hard');
    } else if (evalResult.shouldBranchToEasy) {
      setQueue((prev) => ensureQueueSufficiency(prev, STAGE_04_ITEMS, 'easy'));
      setActiveTier('easy');
    } else if (queue.length - (activeItemIndex + 1) + evalResult.nextValidScoredCount < DEFAULT_ADAPTIVE_CONFIG.minScoredItems) {
      setQueue((prev) => ensureQueueSufficiency(prev, STAGE_04_ITEMS, activeTier === 'hard' ? 'easy' : 'hard'));
    }

    // Advance after brief pause
    setTimeout(() => {
      if (activeItemIndex + 1 < queue.length && !evalResult.shouldTerminateStage) {
        setActiveItemIndex((idx) => idx + 1);
      } else {
        onStageComplete();
      }
    }, 1000);
  };

  const handleSkip = () => {
    if (!currentItem || isProcessingSelection) return;

    recordResponse({
      domain: 'word_recognition',
      task_type: currentItem.taskType,
      item_id: currentItem.id,
      difficulty_tier: currentItem.difficultyTier,
      is_practice_item: currentItem.isPractice,
      presented_content: { prompt: currentItem.promptText },
      expected_answer: currentItem.expectedAnswerId,
      selected_answer: null,
      is_correct: false,
      response_time_ms: Date.now() - itemStartTimeRef.current,
      attempt_count: attemptsCountRef.current,
      was_skipped: true,
      accidental_touch_flag: false,
      error_classification: 'SKIPPED_BY_USER',
    });

    if (queue.length - (activeItemIndex + 1) + validScoredCountRef.current < DEFAULT_ADAPTIVE_CONFIG.minScoredItems) {
      setQueue((prev) => ensureQueueSufficiency(prev, STAGE_04_ITEMS, activeTier === 'hard' ? 'easy' : 'hard'));
    }

    if (activeItemIndex + 1 < queue.length) {
      setActiveItemIndex((idx) => idx + 1);
    } else {
      onStageComplete();
    }
  };

  if (!currentItem) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <p className="text-sm font-bold text-slate-700">Stage 04 complete!</p>
      </div>
    );
  }

  const scoredIndex = queue.slice(0, activeItemIndex + 1).filter((i) => !i.isPractice).length;
  const totalScored = Math.max(queue.filter((i) => !i.isPractice).length, DEFAULT_ADAPTIVE_CONFIG.minScoredItems);

  return (
    <div className="flex flex-col w-full max-w-lg mx-auto px-4 py-5 gap-5 animate-fade-in" style={{ minHeight: '100dvh' }}>
      {/* Top Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-black text-xs">
            04
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-800">Island 4: Word Safari 🦁</h2>
            <p className="text-[11px] font-semibold text-slate-500">
              {currentItem.isPractice ? 'Warm-Up Practice' : `Item ${scoredIndex} of ${totalScored}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReplayAudio}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-100 text-purple-700 text-xs font-bold hover:bg-purple-200 transition active:scale-95 cursor-pointer"
            aria-label="Replay audio word prompt"
          >
            <Volume2 size={15} />
            <span>Hear Word</span>
          </button>
          <Lyra size={36} />
        </div>
      </div>

      {/* Progress Dots */}
      <div className="flex items-center gap-1 w-full">
        {queue.map((item, idx) => {
          const isDone = idx < activeItemIndex;
          const isCurrent = idx === activeItemIndex;
          return (
            <div
              key={item.id}
              className="h-1.5 flex-1 rounded-full transition-all duration-300"
              style={{
                background: isDone
                  ? 'var(--color-grass, #22c55e)'
                  : isCurrent
                  ? 'var(--color-sky, #38bdf8)'
                  : 'hsl(225 15% 90%)',
              }}
            />
          );
        })}
      </div>

      {/* Lyra Prompt Card */}
      <div
        className="p-4 rounded-3xl border-2 flex items-start gap-3.5 shadow-sm"
        style={{
          background: currentItem.isPractice ? '#faf5ff' : '#fefce8',
          borderColor: currentItem.isPractice ? '#d8b4fe' : '#fef08a',
        }}
      >
        <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
          <Sparkles size={20} />
        </div>
        <div className="space-y-0.5">
          {currentItem.isPractice && (
            <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
              Practice Item
            </span>
          )}
          <h3 className="text-sm sm:text-base font-black text-slate-800 leading-snug">
            {currentItem.promptText}
          </h3>
        </div>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-2 gap-3.5 pt-2 flex-1 items-center">
        {currentItem.options.map((opt) => {
          const isSelected = selectedOptionId === opt.id;
          const isCorrect = opt.isCorrect;

          let btnBg = 'white';
          let btnBorder = '2px solid #e2e8f0';
          let textColor = 'var(--color-ink)';

          if (isSelected) {
            if (isCorrect) {
              btnBg = '#f0fdf4';
              btnBorder = '2.5px solid #22c55e';
              textColor = '#15803d';
            } else {
              btnBg = '#faf5ff';
              btnBorder = '2.5px solid #a855f7';
              textColor = '#7e22ce';
            }
          }

          return (
            <button
              key={opt.id}
              onClick={() => handleSelectOption(opt)}
              disabled={isProcessingSelection}
              className="min-h-[85px] p-4 rounded-3xl flex flex-col items-center justify-center gap-1 shadow-sm transition-all duration-150 active:scale-95 cursor-pointer touch-target hover:border-slate-300 disabled:cursor-not-allowed"
              style={{
                background: btnBg,
                border: btnBorder,
                color: textColor,
              }}
            >
              {opt.icon && <span className="text-3xl mb-1">{opt.icon}</span>}
              <span className="text-xl sm:text-2xl font-black tracking-wide">{opt.label}</span>
              {isSelected && (
                <div className="animate-fade-in">
                  <CheckCircle2 size={16} className={isCorrect ? 'text-green-600' : 'text-purple-600'} />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Controls */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={handleSkip}
          disabled={isProcessingSelection}
          className="text-xs font-bold text-slate-400 hover:text-slate-600 transition px-3 py-2 rounded-xl active:scale-95 cursor-pointer disabled:opacity-30"
        >
          Skip question
        </button>

        <span className="text-[11px] font-semibold text-slate-400">
          Island 4 of 10
        </span>
      </div>
    </div>
  );
}
