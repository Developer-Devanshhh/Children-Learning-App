/**
 * Lyra — the companion doodle character (Phase 1: idle only)
 *
 * An SVG-drawn animated creature that sits in the corner.
 * - Floats gently at rest (CSS animation)
 * - Can wiggle when called (controlled via prop)
 * - Phase 2 will wire this to attention module triggers
 *
 * Design: simple, hand-drawn-feeling, gender-neutral, non-threatening.
 */

interface LyraProps {
  wiggling?: boolean;
  size?: number;
  className?: string;
}

export function Lyra({ wiggling = false, size = 80, className = '' }: LyraProps) {
  return (
    <div
      className={`animate-float ${wiggling ? 'animate-wiggle' : ''} ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label="Lyra, your learning companion"
    >
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Body */}
        <ellipse cx="50" cy="60" rx="28" ry="30" fill="hsl(270 55% 72%)" />

        {/* Head */}
        <circle cx="50" cy="34" r="22" fill="hsl(270 55% 78%)" />

        {/* Ears */}
        <ellipse cx="33" cy="18" rx="7" ry="11" fill="hsl(270 55% 72%)" transform="rotate(-15 33 18)" />
        <ellipse cx="67" cy="18" rx="7" ry="11" fill="hsl(270 55% 72%)" transform="rotate(15 67 18)" />
        {/* Ear inners */}
        <ellipse cx="33" cy="18" rx="4" ry="7" fill="hsl(340 80% 85%)" transform="rotate(-15 33 18)" />
        <ellipse cx="67" cy="18" rx="4" ry="7" fill="hsl(340 80% 85%)" transform="rotate(15 67 18)" />

        {/* Eyes */}
        <circle cx="41" cy="33" r="5" fill="white" />
        <circle cx="59" cy="33" r="5" fill="white" />
        <circle cx="42" cy="34" r="2.5" fill="hsl(225 25% 18%)" />
        <circle cx="60" cy="34" r="2.5" fill="hsl(225 25% 18%)" />
        {/* Eye shine */}
        <circle cx="43" cy="32.5" r="1" fill="white" />
        <circle cx="61" cy="32.5" r="1" fill="white" />

        {/* Nose */}
        <ellipse cx="50" cy="39" rx="3" ry="2" fill="hsl(340 70% 70%)" />

        {/* Smile */}
        <path d="M 43 44 Q 50 50 57 44" stroke="hsl(225 25% 18%)" strokeWidth="2" strokeLinecap="round" fill="none" />

        {/* Cheeks */}
        <circle cx="36" cy="42" r="5" fill="hsl(340 80% 85%)" opacity="0.6" />
        <circle cx="64" cy="42" r="5" fill="hsl(340 80% 85%)" opacity="0.6" />

        {/* Arms */}
        <ellipse cx="24" cy="62" rx="8" ry="14" fill="hsl(270 55% 72%)" transform="rotate(20 24 62)" />
        <ellipse cx="76" cy="62" rx="8" ry="14" fill="hsl(270 55% 72%)" transform="rotate(-20 76 62)" />

        {/* Belly spot */}
        <ellipse cx="50" cy="64" rx="13" ry="15" fill="hsl(270 55% 88%)" opacity="0.7" />

        {/* Tail */}
        <path d="M 70 80 Q 88 72 82 62" stroke="hsl(270 55% 72%)" strokeWidth="8" strokeLinecap="round" fill="none" />
      </svg>
    </div>
  );
}
