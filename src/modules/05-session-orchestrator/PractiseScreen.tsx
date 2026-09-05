/**
 * PractiseScreen — the tracing session screen
 *
 * Wraps TracingCanvas + FeedbackOverlay into a full session screen.
 * - Shows the letter header + pronunciation tip
 * - Lyra companion in the corner (idle)
 * - Canvas for tracing
 * - Feedback overlay after Check
 * - Back to letter selector
 *
 * Phase 2: wires session logging via useSessionStore.
 * Uses the selected child's age_band for scorer calibration.
 */

import { useCallback, useEffect, useState } from 'react';
import { TracingCanvas } from '@/modules/01-canvas-tracing/TracingCanvas';
import { FeedbackOverlay } from '@/modules/01-canvas-tracing/FeedbackOverlay';
import { Lyra } from '@/modules/04-attention-agent/Lyra';
import type { Grapheme } from '@/data/letter-corpus/graphemes';
import type { TracingScore } from '@/modules/01-canvas-tracing/scorer';
import { useChildStore } from '@/stores/useChildStore';
import { useSessionStore } from '@/stores/useSessionStore';

interface PractiseScreenProps {
  grapheme: Grapheme;
  onBack: () => void;
  onNext: () => void;
}

export function PractiseScreen({ grapheme, onBack, onNext }: PractiseScreenProps) {
  const { selectedChild } = useChildStore();
  const { startAttempt, logSession } = useSessionStore();

  const [score, setScore] = useState<TracingScore | null>(null);
  const [sessionKey, setSessionKey] = useState(0); // remount TracingCanvas on retry

  // Determine age band — fall back to '8-9' in offline mode
  const ageBand = selectedChild?.age_band ?? '8-9';

  // Start a new attempt counter when grapheme changes or on mount
  useEffect(() => {
    startAttempt(grapheme.id);
  }, [grapheme.id, startAttempt]);

  const handleResult = useCallback(async (s: TracingScore) => {
    setScore(s);

    // Log to Supabase (or offline outbox) if a child is selected
    if (selectedChild) {
      const strokeList = s.strokes;
      const strokeCount = Math.max(strokeList.length, 1);
      const coverage = strokeList.reduce((acc: number, p) => acc + p.coverageFraction, 0) / strokeCount * 100;
      const startHit = strokeList.filter((p) => p.startPointHit).length / strokeCount * 100;

      await logSession(selectedChild, {
        grapheme_id: grapheme.id,
        score_overall: s.overall,
        score_coverage: coverage,
        score_start: startHit,
        score_stroke_count: strokeList.length > 0 ? 100 : 0,
        band: s.band,
      });
    }
  }, [selectedChild, grapheme.id, logSession]);

  const handleTryAgain = useCallback(() => {
    setScore(null);
    setSessionKey(k => k + 1);
    startAttempt(grapheme.id); // increment attempt counter
  }, [grapheme.id, startAttempt]);

  const handleNext = useCallback(() => {
    setScore(null);
    setSessionKey(k => k + 1);
    onNext();
  }, [onNext]);

  return (
    <div className="flex flex-col w-full max-w-sm mx-auto px-4 pt-4 pb-10 gap-4 animate-fade-in">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="touch-target rounded-2xl px-4 text-sm font-bold transition-all active:scale-95"
          style={{
            background: 'hsl(225 15% 94%)',
            color: 'var(--color-ink-muted)',
            border: '2px solid hsl(225 15% 85%)',
          }}
          aria-label="Back to letter selection"
        >
          ← Back
        </button>

        {/* Child name badge + Lyra */}
        <div className="flex items-center gap-2">
          {selectedChild && (
            <span
              className="rounded-full px-3 py-1 text-xs font-bold"
              style={{ background: 'var(--color-sky-light)', color: 'var(--color-sky-dark)' }}
            >
              {selectedChild.name}
            </span>
          )}
          <Lyra size={48} />
        </div>
      </div>

      {/* Letter name */}
      <div className="flex flex-col items-center gap-1">
        <div
          className="flex items-center justify-center rounded-full text-white font-black"
          style={{
            width: 72,
            height: 72,
            background: grapheme.color,
            fontSize: '2.6rem',
            boxShadow: `0 6px 20px ${grapheme.color}55`,
            lineHeight: 1,
          }}
        >
          {grapheme.id}
        </div>
        <p style={{ color: 'var(--color-ink-muted)', fontSize: '0.85rem', marginTop: 4 }}>
          Trace the letter <strong>{grapheme.label}</strong>
        </p>
        <p style={{ color: 'var(--color-ink-muted)', fontSize: '0.78rem', opacity: 0.75 }}>
          Follow the coloured dots, then trace over the guide!
        </p>
      </div>

      {/* Canvas or Feedback */}
      {score === null ? (
        <TracingCanvas
          key={sessionKey}
          grapheme={grapheme}
          ageBand={ageBand}
          onResult={handleResult}
        />
      ) : (
        <FeedbackOverlay
          score={score}
          letterLabel={grapheme.label}
          onTryAgain={handleTryAgain}
          onNext={handleNext}
        />
      )}

      {/* Tip */}
      {score === null && (
        <p
          className="text-center animate-fade-in"
          style={{ fontSize: '0.78rem', color: 'var(--color-ink-muted)' }}
        >
          Watch the guide, then draw over it. Coloured dots show where to start each stroke.
        </p>
      )}
    </div>
  );
}
