/**
 * TracingCanvas — Core Phase 1 component
 *
 * Renders:
 *   1. SVG guide layer  — animated stroke-dasharray guide + static reference outline
 *   2. Ink layer        — child's freehand drawing via perfect-freehand → SVG path
 *   3. Live feedback    — proximity ring around the current target waypoint;
 *                         ink turns green when the child is "on track", red when drifting
 *   4. Control bar      — Watch guide again / Check / Clear / Audio toggle
 *
 * Real-time feedback strategy:
 *   - Every pointermove we check distance from cursor to the NEAREST ACTIVE WAYPOINT
 *     across all ref strokes. When distance < NEAR_THRESHOLD the ring pulses green
 *     and we play a waypoint-hit chime (once per waypoint).
 *   - Ink colour is tinted: green (on-track) → dark (neutral) → red (far off).
 *   - All hot-path logic mutates DOM directly to avoid React re-render jank.
 *
 * Data flow:
 *   pointer events → ref arrays (NOT React state during drawing)
 *   pointerup       → commit stroke → update React state once
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { getStroke } from 'perfect-freehand';
import { Volume2, VolumeX } from 'lucide-react';
import type { Grapheme, Waypoint } from '@/data/letter-corpus/graphemes';
import { scoreTracing, type CapturedStroke, type TracingScore } from './scorer';
import { audioEngine } from '@/modules/audio/audioEngine';

// ── perfect-freehand options ───────────────────────────────────────────────
const PF_OPTIONS = {
  size: 16,
  thinning: 0.5,
  smoothing: 0.5,
  streamline: 0.5,
  simulatePressure: true,
};

// Convert pf output to SVG path d string
function getSvgPathFromStroke(stroke: number[][]): string {
  if (!stroke.length) return '';
  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      acc.push(`${x0},${y0}`, `${(x0 + x1) / 2},${(y0 + y1) / 2}`);
      return acc;
    },
    ['M', `${stroke[0][0]},${stroke[0][1]}`, 'Q'],
  );
  d.push('Z');
  return d.join(' ');
}

function dist(a: Waypoint, b: { x: number; y: number }): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

// ── Guide animation hook ───────────────────────────────────────────────────
function useGuideAnimation(playing: boolean, duration = 2500) {
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);

  useEffect(() => {
    if (!playing) { setProgress(0); return; }
    startRef.current = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startRef.current;
      const p = Math.min(elapsed / duration, 1);
      setProgress(p);
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing, duration]);

  return progress;
}

// ── Constants ──────────────────────────────────────────────────────────────
const NEAR_THRESHOLD  = 45;  // px in SVG space — "on track"
const FAR_THRESHOLD   = 90;  // px — "off track" (ink goes red)
const INK_ON_TRACK    = 'hsl(142 55% 38%)';   // green
const INK_NEUTRAL     = 'hsl(225 25% 18%)';   // dark
const INK_OFF_TRACK   = 'hsl(10 85% 55%)';    // red

// ── Component ──────────────────────────────────────────────────────────────
interface TracingCanvasProps {
  grapheme: Grapheme;
  ageBand?: string;
  onResult: (score: TracingScore) => void;
}

export function TracingCanvas({ grapheme, ageBand = 'unknown', onResult }: TracingCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  // Raw capture — never goes through React state during drawing
  const activeStrokeRef = useRef<CapturedStroke>([]);
  const allStrokesRef   = useRef<CapturedStroke[]>([]);

  // Per-stroke waypoint progress (which index we've reached per stroke)
  const waypointProgressRef = useRef<number[]>(grapheme.strokes.map(() => 0));
  // Set of globally-already-chimed waypoints (to avoid duplicate sounds)
  const chimedflagRef = useRef<Set<string>>(new Set());

  // Rendered ink paths (committed on pointerup)
  const [inkPaths, setInkPaths] = useState<{ d: string; color: string }[]>([]);
  const activePathRef   = useRef('');
  const activeColorRef  = useRef(INK_NEUTRAL);

  // Audio mute state
  const [audioOn, setAudioOn] = useState(true);

  // Guide playback
  const [guidePlaying, setGuidePlaying] = useState(true);
  const guideProgress = useGuideAnimation(guidePlaying);

  // Reset waypoint progress when grapheme changes
  useEffect(() => {
    waypointProgressRef.current = grapheme.strokes.map(() => 0);
    chimedflagRef.current = new Set();
  }, [grapheme]);

  const replayGuide = useCallback(() => {
    setGuidePlaying(false);
    setTimeout(() => setGuidePlaying(true), 50);
  }, []);

  const clearCanvas = useCallback(() => {
    allStrokesRef.current = [];
    activeStrokeRef.current = [];
    waypointProgressRef.current = grapheme.strokes.map(() => 0);
    chimedflagRef.current = new Set();
    setInkPaths([]);
  }, [grapheme]);

  const handleCheck = useCallback(() => {
    const score = scoreTracing(grapheme, allStrokesRef.current, ageBand);
    audioEngine.playResultSound(score.band);
    onResult(score);
  }, [grapheme, ageBand, onResult]);

  const toggleAudio = useCallback(() => {
    setAudioOn(prev => {
      audioEngine.setEnabled(!prev);
      return !prev;
    });
  }, []);

  // ── SVG coordinate helper ──────────────────────────────────────────────
  const getSVGPoint = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM()!.inverse());
    return { x: svgP.x, y: svgP.y };
  }, []);

  // ── Real-time feedback helper ──────────────────────────────────────────
  // Returns the nearest distance to ANY uncrossed waypoint across all strokes
  const checkProximity = useCallback((x: number, y: number, t: number) => {
    let nearestDist = Infinity;
    let hitKey: string | null = null;

    grapheme.strokes.forEach((stroke, si) => {
      const wpIdx = waypointProgressRef.current[si];
      if (wpIdx >= stroke.waypoints.length) return;

      const wp = stroke.waypoints[wpIdx];
      const d = dist(wp, { x, y });
      if (d < nearestDist) nearestDist = d;

      if (d <= NEAR_THRESHOLD) {
        hitKey = `${si}-${wpIdx}`;
        if (!chimedflagRef.current.has(hitKey)) {
          chimedflagRef.current.add(hitKey);
          waypointProgressRef.current[si] = wpIdx + 1;
          audioEngine.playWaypointHit();
        }
      }
    });

    // Draw tick (throttled)
    audioEngine.playDrawTick(t);

    // Determine ink colour
    if (nearestDist <= NEAR_THRESHOLD) return INK_ON_TRACK;
    if (nearestDist >= FAR_THRESHOLD)  return INK_OFF_TRACK;
    // Interpolate between neutral and red
    const ratio = (nearestDist - NEAR_THRESHOLD) / (FAR_THRESHOLD - NEAR_THRESHOLD);
    // Simple: past halfway goes red
    return ratio > 0.5 ? INK_OFF_TRACK : INK_NEUTRAL;
  }, [grapheme]);

  // ── Pointer events ─────────────────────────────────────────────────────
  const onPointerDown = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    (e.target as Element).setPointerCapture(e.pointerId);
    const { x, y } = getSVGPoint(e);
    activeColorRef.current = INK_NEUTRAL;
    activeStrokeRef.current = [{ x, y, t: e.timeStamp, pressure: e.pressure || 0.5 }];
  }, [getSVGPoint]);

  const onPointerMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (activeStrokeRef.current.length === 0) return;
    const { x, y } = getSVGPoint(e);
    activeStrokeRef.current.push({ x, y, t: e.timeStamp, pressure: e.pressure || 0.5 });

    // Proximity check → update colour
    const color = checkProximity(x, y, e.timeStamp);
    activeColorRef.current = color;

    // Update live ink path + colour (direct DOM, zero React re-render)
    const pts = activeStrokeRef.current.map(p => [p.x, p.y, p.pressure ?? 0.5]);
    const stroke = getStroke(pts, { ...PF_OPTIONS, last: false });
    activePathRef.current = getSvgPathFromStroke(stroke);

    const liveEl = document.getElementById('lyralearn-live-ink');
    if (liveEl) {
      liveEl.setAttribute('d', activePathRef.current);
      liveEl.setAttribute('fill', color);
    }

    // Update proximity ring
    const ringEl = document.getElementById('lyralearn-prox-ring');
    if (ringEl) {
      ringEl.setAttribute('cx', String(x));
      ringEl.setAttribute('cy', String(y));
      ringEl.setAttribute('r', String(NEAR_THRESHOLD));
      const isNear = color === INK_ON_TRACK;
      ringEl.setAttribute('stroke', isNear ? 'hsl(142 55% 48%)' : 'hsl(225 15% 80%)');
      ringEl.setAttribute('stroke-width', isNear ? '2.5' : '1.5');
      ringEl.setAttribute('opacity', '0.6');
    }
  }, [getSVGPoint, checkProximity]);

  const onPointerUp = useCallback(() => {
    if (activeStrokeRef.current.length < 2) { activeStrokeRef.current = []; return; }

    // Commit stroke with final colour
    const pts = activeStrokeRef.current.map(p => [p.x, p.y, p.pressure ?? 0.5]);
    const stroke = getStroke(pts, { ...PF_OPTIONS, last: true });
    const path = getSvgPathFromStroke(stroke);
    const color = activeColorRef.current;

    allStrokesRef.current = [...allStrokesRef.current, [...activeStrokeRef.current]];
    activeStrokeRef.current = [];
    activePathRef.current = '';
    activeColorRef.current = INK_NEUTRAL;

    audioEngine.playStrokeDone();

    setInkPaths(prev => [...prev, { d: path, color }]);

    // Reset live ink + hide proximity ring
    const liveEl = document.getElementById('lyralearn-live-ink');
    if (liveEl) { liveEl.setAttribute('d', ''); }
    const ringEl = document.getElementById('lyralearn-prox-ring');
    if (ringEl) { ringEl.setAttribute('opacity', '0'); }
  }, []);

  const totalGuideStrokeCount = grapheme.strokes.length;
  const perStrokeDuration = 1 / totalGuideStrokeCount;

  return (
    <div className="flex flex-col items-center gap-4 w-full select-none">
      {/* Canvas */}
      <div
        className="relative w-full max-w-sm aspect-square rounded-3xl overflow-hidden"
        style={{ background: 'var(--color-surface)', boxShadow: '0 4px 24px hsl(225 25% 18% / 0.10)' }}
      >
        <svg
          ref={svgRef}
          viewBox="0 0 300 300"
          className="w-full h-full touch-none"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          style={{ cursor: 'crosshair' }}
        >
          {/* Guide grid lines */}
          <line x1="150" y1="30"  x2="150" y2="270" stroke="hsl(225 15% 92%)" strokeWidth="1" />
          <line x1="30"  y1="150" x2="270" y2="150" stroke="hsl(225 15% 92%)" strokeWidth="1" />
          <line x1="30"  y1="240" x2="270" y2="240" stroke="hsl(225 15% 90%)" strokeWidth="1.5" strokeDasharray="4 6" />

          {/* Ghost outline */}
          {grapheme.strokes.map((s) => (
            <path
              key={`ghost-${s.order}`}
              d={s.path}
              fill="none"
              stroke="hsl(225 20% 90%)"
              strokeWidth="20"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          {/* Animated guide */}
          {grapheme.strokes.map((s, i) => {
            const localP = Math.max(0, Math.min(1,
              (guideProgress - i * perStrokeDuration) / perStrokeDuration,
            ));
            return (
              <path
                key={`guide-${s.order}`}
                d={s.path}
                fill="none"
                stroke={grapheme.color}
                strokeWidth="18"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={localP > 0 ? 0.85 : 0}
                style={{
                  strokeDasharray: 600,
                  strokeDashoffset: 600 * (1 - localP),
                  transition: localP === 0 ? 'none' : 'stroke-dashoffset 0.05s linear',
                }}
              />
            );
          })}

          {/* Waypoint dots — show next uncrossed waypoint per stroke with a pulsing ring */}
          {grapheme.strokes.map((s, si) => {
            const wpIdx = Math.min(waypointProgressRef.current[si] ?? 0, s.waypoints.length - 1);
            const wp = s.waypoints[wpIdx];
            return (
              <g key={`wp-${si}`}>
                <circle cx={wp.x} cy={wp.y} r="12" fill={grapheme.color} opacity="0.12" />
                <circle cx={wp.x} cy={wp.y} r="7"  fill={grapheme.color} opacity="0.5" />
              </g>
            );
          })}

          {/* Start-point numbered labels */}
          {grapheme.strokes.map((s) => (
            <g key={`start-${s.order}`}>
              <circle cx={s.startPoint.x} cy={s.startPoint.y} r="11" fill={grapheme.color} />
              <text
                x={s.startPoint.x} y={s.startPoint.y + 4}
                textAnchor="middle"
                fontSize="10"
                fontWeight="bold"
                fill="white"
              >
                {s.order}
              </text>
            </g>
          ))}

          {/* Committed ink strokes */}
          {inkPaths.map((ink, i) => (
            <path
              key={`ink-${i}`}
              d={ink.d}
              fill={ink.color}
              className="animate-fade-in"
            />
          ))}

          {/* Live ink — mutated directly */}
          <path id="lyralearn-live-ink" d="" fill={INK_NEUTRAL} />

          {/* Proximity feedback ring — mutated directly */}
          <circle
            id="lyralearn-prox-ring"
            cx="0" cy="0" r={NEAR_THRESHOLD}
            fill="none"
            stroke="hsl(225 15% 80%)"
            strokeWidth="1.5"
            strokeDasharray="6 4"
            opacity="0"
            style={{ pointerEvents: 'none' }}
          />
        </svg>

        {/* Live feedback legend strip */}
        <div style={{
          position: 'absolute',
          bottom: 10,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'hsl(0 0% 100% / 0.85)',
          backdropFilter: 'blur(6px)',
          borderRadius: 20,
          padding: '4px 12px',
          fontSize: '0.65rem',
          fontWeight: 700,
          letterSpacing: '0.06em',
          color: 'var(--color-ink-muted)',
          boxShadow: '0 2px 8px hsl(225 15% 50% / 0.12)',
        }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: INK_ON_TRACK, display: 'inline-block' }} />
          On track
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: INK_OFF_TRACK, display: 'inline-block', marginLeft: 6 }} />
          Off track
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 w-full max-w-sm">
        {/* Audio toggle */}
        <button
          onClick={toggleAudio}
          className="touch-target rounded-2xl px-3 transition-all active:scale-95"
          style={{
            background: audioOn ? 'var(--color-sky-light)' : 'hsl(225 15% 94%)',
            color: audioOn ? 'var(--color-sky-dark)' : 'var(--color-ink-muted)',
            border: `2px solid ${audioOn ? 'var(--color-sky)' : 'hsl(225 15% 85%)'}`,
          }}
          aria-label={audioOn ? 'Mute sound' : 'Unmute sound'}
        >
          {audioOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>

        {/* Watch again */}
        <button
          onClick={replayGuide}
          className="touch-target flex-1 rounded-2xl text-sm font-bold transition-all active:scale-95"
          style={{
            background: 'var(--color-sky-light)',
            color: 'var(--color-sky-dark)',
            border: '2px solid var(--color-sky)',
          }}
          aria-label="Watch guide again"
        >
          Watch again
        </button>

        {/* Clear */}
        <button
          onClick={clearCanvas}
          className="touch-target px-4 rounded-2xl text-sm font-bold transition-all active:scale-95"
          style={{
            background: 'hsl(225 15% 94%)',
            color: 'var(--color-ink-muted)',
            border: '2px solid hsl(225 15% 85%)',
          }}
          aria-label="Clear drawing"
        >
          Clear
        </button>

        {/* Check */}
        <button
          onClick={handleCheck}
          disabled={inkPaths.length === 0}
          className="touch-target flex-1 rounded-2xl text-sm font-bold transition-all active:scale-95 disabled:opacity-40"
          style={{
            background: inkPaths.length > 0 ? 'var(--color-grass)' : 'var(--color-grass-light)',
            color: 'white',
            border: '2px solid var(--color-grass)',
            boxShadow: inkPaths.length > 0 ? '0 4px 12px hsl(142 55% 48% / 0.4)' : 'none',
          }}
          aria-label="Check my tracing"
        >
          Check
        </button>
      </div>
    </div>
  );
}
