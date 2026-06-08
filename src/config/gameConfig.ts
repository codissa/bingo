// ---------------------------------------------------------------------------
// Game configuration — the one place to tweak the bingo basics.
// Default is a STANDARD 75-ball bingo board laid out under B I N G O:
//   B = 1–15, I = 16–30, N = 31–45, G = 46–60, O = 61–75
// ---------------------------------------------------------------------------

/** Lowest number in the machine (inclusive). */
export const MIN_NUMBER = 1

/** Highest number in the machine (inclusive). 75 = US-style B I N G O. */
export const MAX_NUMBER = 75

/** How many recent numbers to keep in `recentNumbers`. */
export const RECENT_COUNT = 5

/** Firestore location of the single shared game document. */
export const GAME_COLLECTION = 'game'
export const GAME_DOC_ID = 'state'

/** How long a sticker popup stays on screen (ms) before auto-dismissing. */
export const STICKER_DURATION_MS = 4500

/** Classic BINGO column letters. */
export const BINGO_LETTERS = ['B', 'I', 'N', 'G', 'O'] as const

/** Numbers per column (75 / 5 = 15). Recomputed from the range. */
export const NUMBERS_PER_COLUMN = Math.ceil(
  (MAX_NUMBER - MIN_NUMBER + 1) / BINGO_LETTERS.length,
)

/** Full ordered list of every number in the configured range. */
export const ALL_NUMBERS: number[] = Array.from(
  { length: MAX_NUMBER - MIN_NUMBER + 1 },
  (_, i) => MIN_NUMBER + i,
)

/**
 * The board as 5 BINGO columns. Each entry is { letter, numbers[] }.
 * e.g. { letter: 'B', numbers: [1..15] }, { letter: 'I', numbers: [16..30] }…
 */
export const BINGO_COLUMNS = BINGO_LETTERS.map((letter, col) => {
  const start = MIN_NUMBER + col * NUMBERS_PER_COLUMN
  const numbers: number[] = []
  for (let i = 0; i < NUMBERS_PER_COLUMN; i++) {
    const n = start + i
    if (n <= MAX_NUMBER) numbers.push(n)
  }
  return { letter, numbers }
})
