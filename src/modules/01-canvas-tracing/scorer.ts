/**
 * Waypoint-crossing scorer (v0 — production-quality starting point)
 *
 * Algorithm:
 *   For each reference stroke, walk the child's captured points in time order
 *   and check whether each waypoint is "crossed" within a tolerance radius.
 *   Waypoints must be crossed IN ORDER (skip-forward allowed, never backward).
 *
 * Returns a 0–100 score and per-stroke breakdown.
 *
 * Why waypoints-first instead of Fréchet immediately:
 *   - Fréchet on raw pointer data at irregular sampling rates is noisy without
 *     careful arc-length resampling. The waypoint check gives real, honest
 *     feedback with < 100 lines of code and is calibratable immediately.
 *   - The Fréchet scorer (tier 1) will be layered on top in v1 using the same
 *     captured point arrays — no data-structure changes needed.
 */

import type { Grapheme, Waypoint } from '@/data/letter-corpus/graphemes';

export interface CapturedPoint { x: number; y: number; t: number; pressure?: number }
export type CapturedStroke = CapturedPoint[];

// Age-band tolerance radii (px in the 300×300 viewBox space)
export const TOLERANCE_BY_AGE: Record<string, number> = {
  '6-7':   45,
  '8-9':   32,
  '10-12': 22,
};

export const DEFAULT_TOLERANCE = 38; // used when age band is unknown

export interface StrokeScore {
  strokeOrder: number;
  waypointsCrossed: number;
  totalWaypoints: number;
  coverageFraction: number;  // 0–1
  startPointHit: boolean;
}

export interface TracingScore {
  /** 0–100 overall score */
  overall: number;
  strokes: StrokeScore[];
  /** qualitative band */
  band: 'amazing' | 'great' | 'getting-there' | 'together';
}

function dist(a: Waypoint, b: { x: number; y: number }): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function scoreStroke(
  refStroke: Grapheme['strokes'][number],
  captured: CapturedStroke,
  tolerance: number,
): StrokeScore {
  const waypoints = refStroke.waypoints;
  let wpIdx = 0;
  let crossed = 0;

  for (const pt of captured) {
    if (wpIdx >= waypoints.length) break;
    if (dist(waypoints[wpIdx], pt) <= tolerance) {
      crossed++;
      wpIdx++;
    }
  }

  const startPointHit =
    captured.length > 0 && dist(refStroke.startPoint, captured[0]) <= tolerance * 1.4;

  return {
    strokeOrder: refStroke.order,
    waypointsCrossed: crossed,
    totalWaypoints: waypoints.length,
    coverageFraction: waypoints.length > 0 ? crossed / waypoints.length : 0,
    startPointHit,
  };
}

export function scoreTracing(
  grapheme: Grapheme,
  capturedStrokes: CapturedStroke[],
  ageBand: string = 'unknown',
): TracingScore {
  const tolerance = TOLERANCE_BY_AGE[ageBand] ?? DEFAULT_TOLERANCE;
  const refStrokes = grapheme.strokes;

  // Pair captured strokes to ref strokes by index (as submitted)
  const strokeScores: StrokeScore[] = refStrokes.map((ref, i) => {
    const captured = capturedStrokes[i] ?? [];
    return scoreStroke(ref, captured, tolerance);
  });

  // Coverage: average fraction of waypoints crossed across all strokes
  const avgCoverage =
    strokeScores.reduce((sum, s) => sum + s.coverageFraction, 0) / Math.max(strokeScores.length, 1);

  // Start-point bonus: what fraction of strokes started near reference
  const startHitFraction =
    strokeScores.filter(s => s.startPointHit).length / Math.max(strokeScores.length, 1);

  // Stroke-count match: penalise if child drew far too many or too few strokes
  const strokeCountRatio = Math.min(capturedStrokes.length / Math.max(refStrokes.length, 1), 1.0);

  // Weighted overall (tune weights once real child data is available)
  const overall = Math.round(
    avgCoverage * 60 +          // coverage: 60%
    startHitFraction * 20 +     // start points: 20%
    strokeCountRatio * 20       // stroke count match: 20%
  );

  const band =
    overall >= 80 ? 'amazing' :
    overall >= 60 ? 'great' :
    overall >= 40 ? 'getting-there' :
    'together';

  return { overall: Math.min(overall, 100), strokes: strokeScores, band };
}
