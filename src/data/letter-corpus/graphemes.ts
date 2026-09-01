/**
 * Letter Corpus — SVG stroke paths for A–Z and 0–9.
 *
 * Each grapheme defines:
 *   - id: the letter/digit
 *   - label: spoken name ("Ay", "Bee", …)
 *   - color: theme accent for this letter's guide
 *   - strokes: ordered list of SVG path strings (one per pen-lift)
 *   - startPoints: {x,y} where each stroke begins (for start-point scoring)
 *   - waypointSets: N ordered waypoints per stroke for waypoint-crossing scorer
 *
 * Coordinate space: 300×300 viewBox.
 * A–Z uppercase (teaching uppercase first per Orton-Gillingham sequencing).
 *
 * Phase 1 ships A, B, C, D, O, S  — extend corpus iteratively.
 */

export interface Waypoint { x: number; y: number }
export interface StrokeRef {
  order: number;
  path: string;            // SVG path d="" string — used to render guide
  startPoint: Waypoint;    // expected pen-down position
  initialDirDeg: number;   // expected initial direction in degrees (0=right,90=down)
  waypoints: Waypoint[];   // ordered waypoints for coverage check
}

export interface Grapheme {
  id: string;
  label: string;           // spoken/displayed name
  color: string;           // CSS var for this letter's guide colour
  strokes: StrokeRef[];
}

export const GRAPHEMES: Grapheme[] = [
  {
    id: 'A',
    label: 'A',
    color: 'var(--color-sky)',
    strokes: [
      {
        order: 1,
        // Left leg: bottom-left up to the apex
        path: 'M 90 240 L 150 60',
        startPoint: { x: 90, y: 240 },
        initialDirDeg: -55,
        waypoints: [
          { x: 90,  y: 240 },
          { x: 110, y: 180 },
          { x: 130, y: 120 },
          { x: 150, y:  60 },
        ],
      },
      {
        order: 2,
        // Right leg: apex down to bottom-right
        path: 'M 150 60 L 210 240',
        startPoint: { x: 150, y: 60 },
        initialDirDeg: 55,
        waypoints: [
          { x: 150, y:  60 },
          { x: 170, y: 120 },
          { x: 190, y: 180 },
          { x: 210, y: 240 },
        ],
      },
      {
        order: 3,
        // Crossbar
        path: 'M 110 165 L 190 165',
        startPoint: { x: 110, y: 165 },
        initialDirDeg: 0,
        waypoints: [
          { x: 110, y: 165 },
          { x: 150, y: 165 },
          { x: 190, y: 165 },
        ],
      },
    ],
  },
  {
    id: 'B',
    label: 'B',
    color: 'var(--color-lavender)',
    strokes: [
      {
        order: 1,
        // Vertical spine
        path: 'M 90 60 L 90 240',
        startPoint: { x: 90, y: 60 },
        initialDirDeg: 90,
        waypoints: [
          { x: 90, y:  60 },
          { x: 90, y: 150 },
          { x: 90, y: 240 },
        ],
      },
      {
        order: 2,
        // Upper bump: top-of-spine → right-bump → mid-spine
        path: 'M 90 60 C 180 60 180 150 90 150',
        startPoint: { x: 90, y: 60 },
        initialDirDeg: 0,
        waypoints: [
          { x: 90,  y:  60 },
          { x: 155, y:  75 },
          { x: 175, y: 110 },
          { x: 155, y: 138 },
          { x: 90,  y: 150 },
        ],
      },
      {
        order: 3,
        // Lower bump: mid-spine → right-bump → bottom-spine
        path: 'M 90 150 C 200 150 200 240 90 240',
        startPoint: { x: 90, y: 150 },
        initialDirDeg: 0,
        waypoints: [
          { x: 90,  y: 150 },
          { x: 165, y: 165 },
          { x: 190, y: 196 },
          { x: 165, y: 228 },
          { x: 90,  y: 240 },
        ],
      },
    ],
  },
  {
    id: 'C',
    label: 'C',
    color: 'var(--color-sun)',
    strokes: [
      {
        order: 1,
        // C arc — one stroke, anticlockwise from upper-right to lower-right
        path: 'M 210 100 A 75 90 0 1 0 210 200',
        startPoint: { x: 210, y: 100 },
        initialDirDeg: 200,
        waypoints: [
          { x: 210, y: 100 },
          { x: 155, y:  70 },
          { x:  90, y: 150 },
          { x: 155, y: 230 },
          { x: 210, y: 200 },
        ],
      },
    ],
  },
  {
    id: 'D',
    label: 'D',
    color: 'var(--color-grass)',
    strokes: [
      {
        order: 1,
        path: 'M 90 60 L 90 240',
        startPoint: { x: 90, y: 60 },
        initialDirDeg: 90,
        waypoints: [
          { x: 90, y:  60 },
          { x: 90, y: 150 },
          { x: 90, y: 240 },
        ],
      },
      {
        order: 2,
        // Rightward arc
        path: 'M 90 60 C 240 60 240 240 90 240',
        startPoint: { x: 90, y: 60 },
        initialDirDeg: 0,
        waypoints: [
          { x: 90,  y:  60 },
          { x: 185, y:  80 },
          { x: 220, y: 150 },
          { x: 185, y: 220 },
          { x: 90,  y: 240 },
        ],
      },
    ],
  },
  {
    id: 'E',
    label: 'E',
    color: 'var(--color-sky)',
    strokes: [
      {
        order: 1,
        path: 'M 90 60 L 90 240',
        startPoint: { x: 90, y: 60 },
        initialDirDeg: 90,
        waypoints: [
          { x: 90, y:  60 },
          { x: 90, y: 150 },
          { x: 90, y: 240 },
        ],
      },
      {
        order: 2,
        path: 'M 90 60 L 190 60',
        startPoint: { x: 90, y: 60 },
        initialDirDeg: 0,
        waypoints: [{ x: 90, y: 60 }, { x: 140, y: 60 }, { x: 190, y: 60 }],
      },
      {
        order: 3,
        path: 'M 90 150 L 170 150',
        startPoint: { x: 90, y: 150 },
        initialDirDeg: 0,
        waypoints: [{ x: 90, y: 150 }, { x: 130, y: 150 }, { x: 170, y: 150 }],
      },
      {
        order: 4,
        path: 'M 90 240 L 190 240',
        startPoint: { x: 90, y: 240 },
        initialDirDeg: 0,
        waypoints: [{ x: 90, y: 240 }, { x: 140, y: 240 }, { x: 190, y: 240 }],
      },
    ],
  },
  {
    id: 'F',
    label: 'F',
    color: 'var(--color-sun)',
    strokes: [
      {
        order: 1,
        path: 'M 90 60 L 90 240',
        startPoint: { x: 90, y: 60 },
        initialDirDeg: 90,
        waypoints: [
          { x: 90, y:  60 },
          { x: 90, y: 150 },
          { x: 90, y: 240 },
        ],
      },
      {
        order: 2,
        path: 'M 90 60 L 190 60',
        startPoint: { x: 90, y: 60 },
        initialDirDeg: 0,
        waypoints: [{ x: 90, y: 60 }, { x: 140, y: 60 }, { x: 190, y: 60 }],
      },
      {
        order: 3,
        path: 'M 90 150 L 170 150',
        startPoint: { x: 90, y: 150 },
        initialDirDeg: 0,
        waypoints: [{ x: 90, y: 150 }, { x: 130, y: 150 }, { x: 170, y: 150 }],
      },
    ],
  },
  {
    id: 'G',
    label: 'G',
    color: 'var(--color-grass)',
    strokes: [
      {
        order: 1,
        path: 'M 210 100 A 75 90 0 1 0 210 200 L 150 200',
        startPoint: { x: 210, y: 100 },
        initialDirDeg: 200,
        waypoints: [
          { x: 210, y: 100 },
          { x: 155, y:  70 },
          { x:  90, y: 150 },
          { x: 155, y: 230 },
          { x: 210, y: 200 },
          { x: 150, y: 200 },
        ],
      },
    ],
  },
  {
    id: 'H',
    label: 'H',
    color: 'var(--color-lavender)',
    strokes: [
      {
        order: 1,
        path: 'M 90 60 L 90 240',
        startPoint: { x: 90, y: 60 },
        initialDirDeg: 90,
        waypoints: [{ x: 90, y: 60 }, { x: 90, y: 150 }, { x: 90, y: 240 }],
      },
      {
        order: 2,
        path: 'M 210 60 L 210 240',
        startPoint: { x: 210, y: 60 },
        initialDirDeg: 90,
        waypoints: [{ x: 210, y: 60 }, { x: 210, y: 150 }, { x: 210, y: 240 }],
      },
      {
        order: 3,
        path: 'M 90 150 L 210 150',
        startPoint: { x: 90, y: 150 },
        initialDirDeg: 0,
        waypoints: [{ x: 90, y: 150 }, { x: 150, y: 150 }, { x: 210, y: 150 }],
      },
    ],
  },
  {
    id: 'I',
    label: 'I',
    color: 'var(--color-sky)',
    strokes: [
      {
        order: 1,
        path: 'M 150 60 L 150 240',
        startPoint: { x: 150, y: 60 },
        initialDirDeg: 90,
        waypoints: [{ x: 150, y: 60 }, { x: 150, y: 150 }, { x: 150, y: 240 }],
      },
      {
        order: 2,
        path: 'M 110 60 L 190 60',
        startPoint: { x: 110, y: 60 },
        initialDirDeg: 0,
        waypoints: [{ x: 110, y: 60 }, { x: 150, y: 60 }, { x: 190, y: 60 }],
      },
      {
        order: 3,
        path: 'M 110 240 L 190 240',
        startPoint: { x: 110, y: 240 },
        initialDirDeg: 0,
        waypoints: [{ x: 110, y: 240 }, { x: 150, y: 240 }, { x: 190, y: 240 }],
      },
    ],
  },
  {
    id: 'J',
    label: 'J',
    color: 'var(--color-sun)',
    strokes: [
      {
        order: 1,
        path: 'M 170 60 L 170 180 A 40 40 0 0 1 90 180',
        startPoint: { x: 170, y: 60 },
        initialDirDeg: 90,
        waypoints: [
          { x: 170, y: 60 },
          { x: 170, y: 150 },
          { x: 170, y: 180 },
          { x: 130, y: 220 },
          { x: 90, y: 180 },
        ],
      },
      {
        order: 2,
        path: 'M 110 60 L 230 60',
        startPoint: { x: 110, y: 60 },
        initialDirDeg: 0,
        waypoints: [{ x: 110, y: 60 }, { x: 170, y: 60 }, { x: 230, y: 60 }],
      },
    ],
  },
  {
    id: 'K',
    label: 'K',
    color: 'var(--color-grass)',
    strokes: [
      {
        order: 1,
        path: 'M 100 60 L 100 240',
        startPoint: { x: 100, y: 60 },
        initialDirDeg: 90,
        waypoints: [{ x: 100, y: 60 }, { x: 100, y: 150 }, { x: 100, y: 240 }],
      },
      {
        order: 2,
        path: 'M 200 60 L 100 150',
        startPoint: { x: 200, y: 60 },
        initialDirDeg: 140,
        waypoints: [{ x: 200, y: 60 }, { x: 150, y: 105 }, { x: 100, y: 150 }],
      },
      {
        order: 3,
        path: 'M 120 132 L 200 240',
        startPoint: { x: 120, y: 132 },
        initialDirDeg: 55,
        waypoints: [{ x: 120, y: 132 }, { x: 160, y: 186 }, { x: 200, y: 240 }],
      },
    ],
  },
  {
    id: 'L',
    label: 'L',
    color: 'var(--color-sky)',
    strokes: [
      {
        order: 1,
        path: 'M 100 60 L 100 240',
        startPoint: { x: 100, y: 60 },
        initialDirDeg: 90,
        waypoints: [{ x: 100, y: 60 }, { x: 100, y: 150 }, { x: 100, y: 240 }],
      },
      {
        order: 2,
        path: 'M 100 240 L 200 240',
        startPoint: { x: 100, y: 240 },
        initialDirDeg: 0,
        waypoints: [{ x: 100, y: 240 }, { x: 150, y: 240 }, { x: 200, y: 240 }],
      },
    ],
  },
  {
    id: 'M',
    label: 'M',
    color: 'var(--color-lavender)',
    strokes: [
      {
        order: 1,
        path: 'M 80 240 L 80 60',
        startPoint: { x: 80, y: 240 },
        initialDirDeg: -90,
        waypoints: [{ x: 80, y: 240 }, { x: 80, y: 150 }, { x: 80, y: 60 }],
      },
      {
        order: 2,
        path: 'M 80 60 L 150 150 L 220 60',
        startPoint: { x: 80, y: 60 },
        initialDirDeg: 45,
        waypoints: [{ x: 80, y: 60 }, { x: 115, y: 105 }, { x: 150, y: 150 }, { x: 185, y: 105 }, { x: 220, y: 60 }],
      },
      {
        order: 3,
        path: 'M 220 60 L 220 240',
        startPoint: { x: 220, y: 60 },
        initialDirDeg: 90,
        waypoints: [{ x: 220, y: 60 }, { x: 220, y: 150 }, { x: 220, y: 240 }],
      },
    ],
  },
  {
    id: 'N',
    label: 'N',
    color: 'var(--color-sun)',
    strokes: [
      {
        order: 1,
        path: 'M 90 240 L 90 60',
        startPoint: { x: 90, y: 240 },
        initialDirDeg: -90,
        waypoints: [{ x: 90, y: 240 }, { x: 90, y: 150 }, { x: 90, y: 60 }],
      },
      {
        order: 2,
        path: 'M 90 60 L 210 240',
        startPoint: { x: 90, y: 60 },
        initialDirDeg: 55,
        waypoints: [{ x: 90, y: 60 }, { x: 150, y: 150 }, { x: 210, y: 240 }],
      },
      {
        order: 3,
        path: 'M 210 240 L 210 60',
        startPoint: { x: 210, y: 240 },
        initialDirDeg: -90,
        waypoints: [{ x: 210, y: 240 }, { x: 210, y: 150 }, { x: 210, y: 60 }],
      },
    ],
  },
  {
    id: 'O',
    label: 'O',
    color: 'var(--color-coral)',
    strokes: [
      {
        order: 1,
        path: 'M 150 60 A 75 90 0 1 0 150 60.001',
        startPoint: { x: 150, y: 60 },
        initialDirDeg: 0,
        waypoints: [
          { x: 150, y:  60 },
          { x: 220, y: 100 },
          { x: 225, y: 150 },
          { x: 220, y: 200 },
          { x: 150, y: 240 },
          { x:  80, y: 200 },
          { x:  75, y: 150 },
          { x:  80, y: 100 },
          { x: 150, y:  60 },
        ],
      },
    ],
  },
  {
    id: 'P',
    label: 'P',
    color: 'var(--color-grass)',
    strokes: [
      {
        order: 1,
        path: 'M 90 60 L 90 240',
        startPoint: { x: 90, y: 60 },
        initialDirDeg: 90,
        waypoints: [{ x: 90, y: 60 }, { x: 90, y: 150 }, { x: 90, y: 240 }],
      },
      {
        order: 2,
        path: 'M 90 60 C 190 60 190 150 90 150',
        startPoint: { x: 90, y: 60 },
        initialDirDeg: 0,
        waypoints: [{ x: 90, y: 60 }, { x: 150, y: 75 }, { x: 165, y: 105 }, { x: 150, y: 135 }, { x: 90, y: 150 }],
      },
    ],
  },
  {
    id: 'Q',
    label: 'Q',
    color: 'var(--color-sky)',
    strokes: [
      {
        order: 1,
        path: 'M 140 60 A 75 80 0 1 0 140 60.001',
        startPoint: { x: 140, y: 60 },
        initialDirDeg: 0,
        waypoints: [
          { x: 140, y:  60 },
          { x: 210, y:  90 },
          { x: 215, y: 140 },
          { x: 210, y: 190 },
          { x: 140, y: 220 },
          { x:  70, y: 190 },
          { x:  65, y: 140 },
          { x:  70, y:  90 },
          { x: 140, y:  60 },
        ],
      },
      {
        order: 2,
        path: 'M 170 170 L 230 230',
        startPoint: { x: 170, y: 170 },
        initialDirDeg: 45,
        waypoints: [{ x: 170, y: 170 }, { x: 200, y: 200 }, { x: 230, y: 230 }],
      },
    ],
  },
  {
    id: 'R',
    label: 'R',
    color: 'var(--color-lavender)',
    strokes: [
      {
        order: 1,
        path: 'M 90 60 L 90 240',
        startPoint: { x: 90, y: 60 },
        initialDirDeg: 90,
        waypoints: [{ x: 90, y: 60 }, { x: 90, y: 150 }, { x: 90, y: 240 }],
      },
      {
        order: 2,
        path: 'M 90 60 C 190 60 190 150 90 150',
        startPoint: { x: 90, y: 60 },
        initialDirDeg: 0,
        waypoints: [{ x: 90, y: 60 }, { x: 150, y: 75 }, { x: 165, y: 105 }, { x: 150, y: 135 }, { x: 90, y: 150 }],
      },
      {
        order: 3,
        path: 'M 140 150 L 210 240',
        startPoint: { x: 140, y: 150 },
        initialDirDeg: 55,
        waypoints: [{ x: 140, y: 150 }, { x: 175, y: 195 }, { x: 210, y: 240 }],
      },
    ],
  },
  {
    id: 'S',
    label: 'S',
    color: 'var(--color-lavender)',
    strokes: [
      {
        order: 1,
        path: 'M 200 90 C 200 55 100 55 100 120 C 100 185 210 185 210 225 C 210 260 100 260 100 225',
        startPoint: { x: 200, y: 90 },
        initialDirDeg: 200,
        waypoints: [
          { x: 200, y:  90 },
          { x: 150, y:  60 },
          { x: 105, y:  90 },
          { x: 105, y: 120 },
          { x: 150, y: 150 },
          { x: 200, y: 180 },
          { x: 205, y: 225 },
          { x: 155, y: 248 },
          { x: 105, y: 225 },
        ],
      },
    ],
  },
  {
    id: 'T',
    label: 'T',
    color: 'var(--color-sun)',
    strokes: [
      {
        order: 1,
        path: 'M 90 60 L 210 60',
        startPoint: { x: 90, y: 60 },
        initialDirDeg: 0,
        waypoints: [{ x: 90, y: 60 }, { x: 150, y: 60 }, { x: 210, y: 60 }],
      },
      {
        order: 2,
        path: 'M 150 60 L 150 240',
        startPoint: { x: 150, y: 60 },
        initialDirDeg: 90,
        waypoints: [{ x: 150, y: 60 }, { x: 150, y: 150 }, { x: 150, y: 240 }],
      },
    ],
  },
  {
    id: 'U',
    label: 'U',
    color: 'var(--color-grass)',
    strokes: [
      {
        order: 1,
        path: 'M 90 60 L 90 180 A 60 60 0 0 0 210 180 L 210 60',
        startPoint: { x: 90, y: 60 },
        initialDirDeg: 90,
        waypoints: [
          { x: 90, y: 60 },
          { x: 90, y: 160 },
          { x: 110, y: 220 },
          { x: 150, y: 240 },
          { x: 190, y: 220 },
          { x: 210, y: 160 },
          { x: 210, y: 60 },
        ],
      },
    ],
  },
  {
    id: 'V',
    label: 'V',
    color: 'var(--color-sky)',
    strokes: [
      {
        order: 1,
        path: 'M 90 60 L 150 240 L 210 60',
        startPoint: { x: 90, y: 60 },
        initialDirDeg: 60,
        waypoints: [
          { x: 90, y: 60 },
          { x: 120, y: 150 },
          { x: 150, y: 240 },
          { x: 180, y: 150 },
          { x: 210, y: 60 },
        ],
      },
    ],
  },
  {
    id: 'W',
    label: 'W',
    color: 'var(--color-lavender)',
    strokes: [
      {
        order: 1,
        path: 'M 70 60 L 110 240 L 150 120 L 190 240 L 230 60',
        startPoint: { x: 70, y: 60 },
        initialDirDeg: 75,
        waypoints: [
          { x: 70, y: 60 },
          { x: 90, y: 150 },
          { x: 110, y: 240 },
          { x: 130, y: 180 },
          { x: 150, y: 120 },
          { x: 170, y: 180 },
          { x: 190, y: 240 },
          { x: 210, y: 150 },
          { x: 230, y: 60 },
        ],
      },
    ],
  },
  {
    id: 'X',
    label: 'X',
    color: 'var(--color-coral)',
    strokes: [
      {
        order: 1,
        path: 'M 90 60 L 210 240',
        startPoint: { x: 90, y: 60 },
        initialDirDeg: 55,
        waypoints: [{ x: 90, y: 60 }, { x: 150, y: 150 }, { x: 210, y: 240 }],
      },
      {
        order: 2,
        path: 'M 210 60 L 90 240',
        startPoint: { x: 210, y: 60 },
        initialDirDeg: 125,
        waypoints: [{ x: 210, y: 60 }, { x: 150, y: 150 }, { x: 90, y: 240 }],
      },
    ],
  },
  {
    id: 'Y',
    label: 'Y',
    color: 'var(--color-sun)',
    strokes: [
      {
        order: 1,
        path: 'M 90 60 L 150 150',
        startPoint: { x: 90, y: 60 },
        initialDirDeg: 55,
        waypoints: [{ x: 90, y: 60 }, { x: 120, y: 105 }, { x: 150, y: 150 }],
      },
      {
        order: 2,
        path: 'M 210 60 L 150 150',
        startPoint: { x: 210, y: 60 },
        initialDirDeg: 125,
        waypoints: [{ x: 210, y: 60 }, { x: 180, y: 105 }, { x: 150, y: 150 }],
      },
      {
        order: 3,
        path: 'M 150 150 L 150 240',
        startPoint: { x: 150, y: 150 },
        initialDirDeg: 90,
        waypoints: [{ x: 150, y: 150 }, { x: 150, y: 195 }, { x: 150, y: 240 }],
      },
    ],
  },
  {
    id: 'Z',
    label: 'Z',
    color: 'var(--color-grass)',
    strokes: [
      {
        order: 1,
        path: 'M 90 60 L 210 60',
        startPoint: { x: 90, y: 60 },
        initialDirDeg: 0,
        waypoints: [{ x: 90, y: 60 }, { x: 150, y: 60 }, { x: 210, y: 60 }],
      },
      {
        order: 2,
        path: 'M 210 60 L 90 240',
        startPoint: { x: 210, y: 60 },
        initialDirDeg: 125,
        waypoints: [{ x: 210, y: 60 }, { x: 150, y: 150 }, { x: 90, y: 240 }],
      },
      {
        order: 3,
        path: 'M 90 240 L 210 240',
        startPoint: { x: 90, y: 240 },
        initialDirDeg: 0,
        waypoints: [{ x: 90, y: 240 }, { x: 150, y: 240 }, { x: 210, y: 240 }],
      },
    ],
  },
  {
    id: '0',
    label: '0',
    color: 'var(--color-coral)',
    strokes: [
      {
        order: 1,
        path: 'M 150 60 C 90 60 90 240 150 240 C 210 240 210 60 150 60',
        startPoint: { x: 150, y: 60 },
        initialDirDeg: 180,
        waypoints: [
          { x: 150, y: 60 },
          { x: 110, y: 100 },
          { x: 100, y: 150 },
          { x: 110, y: 200 },
          { x: 150, y: 240 },
          { x: 190, y: 200 },
          { x: 200, y: 150 },
          { x: 190, y: 100 },
          { x: 150, y: 60 },
        ],
      },
    ],
  },
  {
    id: '1',
    label: '1',
    color: 'var(--color-sky)',
    strokes: [
      {
        order: 1,
        path: 'M 150 60 L 150 240',
        startPoint: { x: 150, y: 60 },
        initialDirDeg: 90,
        waypoints: [{ x: 150, y: 60 }, { x: 150, y: 150 }, { x: 150, y: 240 }],
      },
    ],
  },
  {
    id: '2',
    label: '2',
    color: 'var(--color-sun)',
    strokes: [
      {
        order: 1,
        path: 'M 100 100 C 100 60 200 60 200 100 C 200 160 100 200 100 240 L 200 240',
        startPoint: { x: 100, y: 100 },
        initialDirDeg: -45,
        waypoints: [
          { x: 100, y: 100 },
          { x: 150, y: 70 },
          { x: 200, y: 100 },
          { x: 175, y: 150 },
          { x: 150, y: 200 },
          { x: 100, y: 240 },
          { x: 150, y: 240 },
          { x: 200, y: 240 },
        ],
      },
    ],
  },
  {
    id: '3',
    label: '3',
    color: 'var(--color-grass)',
    strokes: [
      {
        order: 1,
        path: 'M 100 80 C 100 40 200 40 200 90 C 200 130 150 150 150 150 C 150 150 210 170 210 210 C 210 260 90 260 90 210',
        startPoint: { x: 100, y: 80 },
        initialDirDeg: -45,
        waypoints: [
          { x: 100, y: 80 },
          { x: 150, y: 55 },
          { x: 195, y: 90 },
          { x: 150, y: 150 },
          { x: 205, y: 210 },
          { x: 150, y: 245 },
          { x: 90, y: 210 },
        ],
      },
    ],
  },
  {
    id: '4',
    label: '4',
    color: 'var(--color-lavender)',
    strokes: [
      {
        order: 1,
        path: 'M 180 200 L 90 200 L 150 60 L 150 240',
        startPoint: { x: 180, y: 200 },
        initialDirDeg: 180,
        waypoints: [
          { x: 180, y: 200 },
          { x: 135, y: 200 },
          { x: 90, y: 200 },
          { x: 120, y: 130 },
          { x: 150, y: 60 },
          { x: 150, y: 150 },
          { x: 150, y: 240 },
        ],
      },
    ],
  },
  {
    id: '5',
    label: '5',
    color: 'var(--color-coral)',
    strokes: [
      {
        order: 1,
        path: 'M 190 60 L 110 60 L 110 130 C 110 130 200 110 200 180 C 200 240 100 240 100 190',
        startPoint: { x: 190, y: 60 },
        initialDirDeg: 180,
        waypoints: [
          { x: 190, y: 60 },
          { x: 110, y: 60 },
          { x: 110, y: 130 },
          { x: 155, y: 135 },
          { x: 195, y: 180 },
          { x: 150, y: 225 },
          { x: 100, y: 190 },
        ],
      },
    ],
  },
  {
    id: '6',
    label: '6',
    color: 'var(--color-sky)',
    strokes: [
      {
        order: 1,
        path: 'M 180 70 C 130 50 90 120 90 190 C 90 240 200 240 200 190 C 200 140 90 140 90 190',
        startPoint: { x: 180, y: 70 },
        initialDirDeg: -135,
        waypoints: [
          { x: 180, y: 70 },
          { x: 130, y: 90 },
          { x: 100, y: 140 },
          { x: 90, y: 190 },
          { x: 145, y: 225 },
          { x: 190, y: 190 },
          { x: 145, y: 155 },
          { x: 95, y: 185 },
        ],
      },
    ],
  },
  {
    id: '7',
    label: '7',
    color: 'var(--color-sun)',
    strokes: [
      {
        order: 1,
        path: 'M 90 60 L 210 60 L 130 240',
        startPoint: { x: 90, y: 60 },
        initialDirDeg: 0,
        waypoints: [
          { x: 90, y: 60 },
          { x: 150, y: 60 },
          { x: 210, y: 60 },
          { x: 170, y: 150 },
          { x: 130, y: 240 },
        ],
      },
    ],
  },
  {
    id: '8',
    label: '8',
    color: 'var(--color-grass)',
    strokes: [
      {
        order: 1,
        path: 'M 150 150 C 100 150 100 60 150 60 C 200 60 200 150 150 150 C 90 150 90 240 150 240 C 210 240 210 150 150 150',
        startPoint: { x: 150, y: 150 },
        initialDirDeg: -135,
        waypoints: [
          { x: 150, y: 150 },
          { x: 110, y: 105 },
          { x: 150, y: 60 },
          { x: 190, y: 105 },
          { x: 150, y: 150 },
          { x: 105, y: 195 },
          { x: 150, y: 240 },
          { x: 195, y: 195 },
          { x: 150, y: 150 },
        ],
      },
    ],
  },
  {
    id: '9',
    label: '9',
    color: 'var(--color-lavender)',
    strokes: [
      {
        order: 1,
        path: 'M 120 230 C 170 250 210 180 210 110 C 210 60 100 60 100 110 C 100 160 210 160 210 110',
        startPoint: { x: 120, y: 230 },
        initialDirDeg: 45,
        waypoints: [
          { x: 120, y: 230 },
          { x: 170, y: 210 },
          { x: 200, y: 160 },
          { x: 210, y: 110 },
          { x: 155, y: 75 },
          { x: 110, y: 110 },
          { x: 155, y: 145 },
          { x: 205, y: 115 },
        ],
      },
    ],
  },
];

/** All grapheme IDs for the letter selector grid */
export const ALL_IDS = GRAPHEMES.map(g => g.id);

export function getGrapheme(id: string): Grapheme | undefined {
  return GRAPHEMES.find(g => g.id === id);
}
