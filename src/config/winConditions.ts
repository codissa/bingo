// ---------------------------------------------------------------------------
// Win-condition presets.
//
// A pattern is a 25-bit row-major mask: bit (r*5 + c) is on when that cell of
// a 5x5 bingo card is part of the win. The same representation serves the
// preset gallery AND hand-built custom patterns. Display screens only ever read
// the mask (and, for "any row/col/line", the CYCLING_VARIANTS slice) — they
// never need the labels/text here.
// ---------------------------------------------------------------------------

export interface WinPreset {
  /** Stable id, also written to Firestore as winPatternId. */
  id: string
  /** Short label shown under the admin thumbnail. */
  label: string
  /** Player-facing text; auto-fills winConditionText when the preset is picked. */
  text: string
  /** 25-bit row-major mask (the representative line for cycling presets). */
  mask: number
  /** For "any row/col/line": each qualifying line's mask, so the card cycles. */
  variants?: number[]
  /** Ordered cell indices for the neon sweep. Omit to derive (see deriveOrder). */
  sweepPath?: number[]
}

// --- mask builders ---------------------------------------------------------

const bit = (r: number, c: number) => 1 << (r * 5 + c)
const fromCells = (cells: [number, number][]) =>
  cells.reduce((m, [r, c]) => m | bit(r, c), 0)
const rowMask = (r: number) => fromCells([0, 1, 2, 3, 4].map((c) => [r, c]))
const colMask = (c: number) => fromCells([0, 1, 2, 3, 4].map((r) => [r, c]))

const ROWS = [0, 1, 2, 3, 4].map(rowMask)
const COLS = [0, 1, 2, 3, 4].map(colMask)
const DIAG_MAIN = fromCells([0, 1, 2, 3, 4].map((i) => [i, i])) // ↘
const DIAG_ANTI = fromCells([0, 1, 2, 3, 4].map((i) => [i, 4 - i])) // ↙
export const FULL_MASK = 0x1ffffff // all 25 bits

// Cell index from row/col, for readable sweep paths below.
const idx = (r: number, c: number) => r * 5 + c

// --- preset catalog --------------------------------------------------------

export const WIN_PRESETS: WinPreset[] = [
  {
    id: 'any-line',
    label: 'כל קו',
    text: 'כל קו ישר — שורה, טור או אלכסון!',
    mask: DIAG_MAIN,
    variants: [...ROWS, ...COLS, DIAG_MAIN, DIAG_ANTI],
  },
  {
    id: 'any-row',
    label: 'כל שורה',
    text: 'כל שורה שלמה לרוחב.',
    mask: ROWS[2],
    variants: ROWS,
  },
  {
    id: 'any-col',
    label: 'כל טור',
    text: 'כל טור שלם לאורך.',
    mask: COLS[0],
    variants: COLS,
  },
  { id: 'row-top', label: 'שורה עליונה', text: 'השלימו את השורה העליונה.', mask: ROWS[0] },
  { id: 'row-mid', label: 'שורה אמצעית', text: 'השלימו את השורה האמצעית.', mask: ROWS[2] },
  { id: 'row-bottom', label: 'שורה תחתונה', text: 'השלימו את השורה התחתונה.', mask: ROWS[4] },
  { id: 'col-b', label: 'טור B', text: 'השלימו את טור ה-B.', mask: COLS[0] },
  { id: 'col-i', label: 'טור I', text: 'השלימו את טור ה-I.', mask: COLS[1] },
  { id: 'col-n', label: 'טור N', text: 'השלימו את טור ה-N.', mask: COLS[2] },
  { id: 'col-g', label: 'טור G', text: 'השלימו את טור ה-G.', mask: COLS[3] },
  { id: 'col-o', label: 'טור O', text: 'השלימו את טור ה-O.', mask: COLS[4] },
  {
    id: 'diag-main',
    label: 'אלכסון ↘',
    text: 'אלכסון מהפינה השמאלית-עליונה לימנית-תחתונה.',
    mask: DIAG_MAIN,
  },
  {
    id: 'diag-anti',
    label: 'אלכסון ↙',
    text: 'אלכסון מהפינה הימנית-עליונה לשמאלית-תחתונה.',
    mask: DIAG_ANTI,
  },
  {
    id: 'x-both',
    label: 'איקס',
    text: 'שני האלכסונים — צרו X!',
    mask: DIAG_MAIN | DIAG_ANTI,
    // trace main diag, then anti diag (skip the shared centre)
    sweepPath: [idx(0, 0), idx(1, 1), idx(2, 2), idx(3, 3), idx(4, 4),
                idx(0, 4), idx(1, 3), idx(3, 1), idx(4, 0)],
  },
  {
    id: 'four-corners',
    label: 'ארבע פינות',
    text: 'רק ארבע הפינות.',
    mask: fromCells([[0, 0], [0, 4], [4, 0], [4, 4]]),
    sweepPath: [idx(0, 0), idx(0, 4), idx(4, 4), idx(4, 0)], // clockwise
  },
  {
    id: 'frame',
    label: 'מסגרת חיצונית',
    text: 'כל המסגרת החיצונית.',
    mask: ROWS[0] | ROWS[4] | COLS[0] | COLS[4],
    sweepPath: [
      0, 1, 2, 3, 4, // top L→R
      9, 14, 19, 24, // right ↓
      23, 22, 21, 20, // bottom R→L
      15, 10, 5, // left ↑
    ],
  },
  {
    id: 'square-inner',
    label: 'ריבוע פנימי',
    text: 'מסגרת הריבוע הפנימי 3×3.',
    mask: fromCells([
      [1, 1], [1, 2], [1, 3],
      [2, 1], [2, 3],
      [3, 1], [3, 2], [3, 3],
    ]),
    sweepPath: [idx(1, 1), idx(1, 2), idx(1, 3), idx(2, 3), idx(3, 3), idx(3, 2), idx(3, 1), idx(2, 1)],
  },
  {
    id: 'plus',
    label: 'פלוס / צלב',
    text: 'סימן פלוס — שורה אמצעית וטור אמצעי.',
    mask: ROWS[2] | COLS[2],
    sweepPath: [10, 11, 12, 13, 14, idx(0, 2), idx(1, 2), idx(3, 2), idx(4, 2)],
  },
  {
    id: 'letter-t',
    label: 'אות T',
    text: 'צרו T — שורה עליונה וטור אמצעי.',
    mask: ROWS[0] | COLS[2],
    sweepPath: [0, 1, 2, 3, 4, idx(1, 2), idx(2, 2), idx(3, 2), idx(4, 2)],
  },
  {
    id: 'letter-l',
    label: 'אות L',
    text: 'צרו L — טור שמאלי ושורה תחתונה.',
    mask: COLS[0] | ROWS[4],
    sweepPath: [0, 5, 10, 15, 20, 21, 22, 23, 24],
  },
  {
    id: 'postage-stamp',
    label: 'בול דואר',
    text: 'בול דואר — ריבוע 2×2 בפינה הימנית-עליונה.',
    mask: fromCells([[0, 3], [0, 4], [1, 3], [1, 4]]),
    sweepPath: [idx(0, 3), idx(0, 4), idx(1, 4), idx(1, 3)], // clockwise
  },
  {
    id: 'blackout',
    label: 'לוח מלא',
    text: 'לוח מלא — כל המספרים בכרטיס שלכם!',
    mask: FULL_MASK,
    // boustrophedon snake — no visual jump between rows
    sweepPath: [
      0, 1, 2, 3, 4,
      9, 8, 7, 6, 5,
      10, 11, 12, 13, 14,
      19, 18, 17, 16, 15,
      20, 21, 22, 23, 24,
    ],
  },
]

export const WIN_PRESETS_BY_ID: Record<string, WinPreset> = Object.fromEntries(
  WIN_PRESETS.map((p) => [p.id, p]),
)

/**
 * Display-safe slice (ids → variant masks) for the cards to cycle "any
 * row/col/line" without importing labels/text.
 */
export const CYCLING_VARIANTS: Record<string, number[]> = Object.fromEntries(
  WIN_PRESETS.filter((p) => p.variants).map((p) => [p.id, p.variants as number[]]),
)

/** True for the cell index `i` (0..24) when it's part of the mask. */
export const cellOn = (mask: number, i: number) => ((mask >> i) & 1) === 1

/** Make a fresh id for a newly-saved custom pattern (mirrors makeStickerId). */
export function makeWinPatternId(name: string): string {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  return `${base || 'pattern'}-${Math.floor(performance.now()).toString(36)}`
}

/**
 * Default sweep order for a mask with no explicit sweepPath: row-major
 * (ascending index). Always valid for any shape — straight lines come out in
 * their natural reading direction, custom masks get a predictable chase.
 */
export function deriveOrder(mask: number): number[] {
  const order: number[] = []
  for (let i = 0; i < 25; i++) if (cellOn(mask, i)) order.push(i)
  return order
}
