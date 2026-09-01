/**
 * FeedbackOverlay — shown after the child taps "Check!"
 *
 * Displays the qualitative band (emoji + message) and an option to
 * try again or move to the next letter. Children never see a number.
 */

import { Sparkles, Star, Smile, Handshake } from 'lucide-react';
import type { TracingScore } from './scorer';

interface FeedbackOverlayProps {
  score: TracingScore;
  letterLabel: string;
  onTryAgain: () => void;
  onNext: () => void;
}

const BAND_CONFIG = {
  amazing: {
    icon: Sparkles,
    headline: 'Amazing!',
    sub: 'That was a perfect trace!',
    bg: 'var(--color-sun-light)',
    border: 'var(--color-sun)',
    btnColor: 'var(--color-sun)',
    iconColor: 'hsl(38 95% 45%)',
  },
  great: {
    icon: Star,
    headline: 'Great job!',
    sub: 'Keep going, you\'re doing brilliantly!',
    bg: 'var(--color-grass-light)',
    border: 'var(--color-grass)',
    btnColor: 'var(--color-grass)',
    iconColor: 'hsl(142 55% 40%)',
  },
  'getting-there': {
    icon: Smile,
    headline: 'Getting there!',
    sub: 'Want to try once more?',
    bg: 'var(--color-sky-light)',
    border: 'var(--color-sky)',
    btnColor: 'var(--color-sky)',
    iconColor: 'hsl(200 80% 45%)',
  },
  together: {
    icon: Handshake,
    headline: "Let's do it together!",
    sub: 'Watch the guide again, then trace over it.',
    bg: 'var(--color-lavender-light)',
    border: 'var(--color-lavender)',
    btnColor: 'var(--color-lavender)',
    iconColor: 'hsl(270 55% 55%)',
  },
};

export function FeedbackOverlay({ score, letterLabel, onTryAgain, onNext }: FeedbackOverlayProps) {
  const cfg = BAND_CONFIG[score.band];
  const IconComponent = cfg.icon;

  return (
    <div
      className="w-full max-w-sm rounded-3xl p-6 flex flex-col items-center gap-4 animate-bounce-in"
      style={{
        background: cfg.bg,
        border: `2px solid ${cfg.border}`,
        boxShadow: '0 4px 20px hsl(225 25% 18% / 0.08)',
      }}
    >
      <div 
        className="w-16 h-16 rounded-full flex items-center justify-center animate-star-pop"
        style={{ 
          background: 'var(--color-surface)',
          border: `2px solid ${cfg.border}`,
          boxShadow: '0 4px 12px hsl(225 25% 18% / 0.06)'
        }}
      >
        <IconComponent size={34} style={{ color: cfg.iconColor }} />
      </div>
      <h2 className="text-2xl text-center" style={{ color: 'var(--color-ink)' }}>
        {cfg.headline}
      </h2>
      <p className="text-center" style={{ color: 'var(--color-ink-muted)', fontSize: '1rem' }}>
        {cfg.sub}
      </p>

      <div className="flex gap-3 w-full mt-2">
        <button
          onClick={onTryAgain}
          className="touch-target flex-1 rounded-2xl text-sm font-bold transition-all active:scale-95"
          style={{
            background: 'var(--color-surface)',
            color: 'var(--color-ink)',
            border: `2px solid ${cfg.border}`,
          }}
        >
          Try {letterLabel} again
        </button>
        <button
          onClick={onNext}
          className="touch-target flex-1 rounded-2xl text-sm font-bold text-white transition-all active:scale-95"
          style={{
            background: cfg.btnColor,
            border: `2px solid ${cfg.btnColor}`,
            boxShadow: `0 4px 12px ${cfg.btnColor}66`,
          }}
        >
          Next letter →
        </button>
      </div>
    </div>
  );
}
