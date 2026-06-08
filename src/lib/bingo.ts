import { BINGO_LETTERS, MAX_NUMBER, MIN_NUMBER, RECENT_COUNT } from '../config/gameConfig'

// ---------------------------------------------------------------------------
// Pure bingo helpers. No Firebase here — easy to reason about and test.
// ---------------------------------------------------------------------------

/**
 * The recent-numbers invariant: the last RECENT_COUNT called numbers, newest
 * first. This is the ONLY place recentNumbers is built, so it is always
 * "the last 5 called numbers in reverse order".
 */
export function computeRecent(calledNumbers: number[]): number[] {
  return calledNumbers.slice(-RECENT_COUNT).reverse()
}

/** The last called number, or null if none. */
export function lastOf(calledNumbers: number[]): number | null {
  return calledNumbers.length > 0 ? calledNumbers[calledNumbers.length - 1] : null
}

/**
 * Classic BINGO column letter for a number, assuming the range is split into
 * 5 even columns (B I N G O). Purely cosmetic flair.
 */
export function letterFor(n: number | null | undefined): string {
  if (n == null) return ''
  const span = MAX_NUMBER - MIN_NUMBER + 1
  const perColumn = Math.ceil(span / BINGO_LETTERS.length)
  const index = Math.min(
    BINGO_LETTERS.length - 1,
    Math.floor((n - MIN_NUMBER) / perColumn),
  )
  return BINGO_LETTERS[index]
}

/** Pick a random number that hasn't been called yet. Null if all are called. */
export function pickRandomUncalled(
  calledNumbers: number[],
  min: number = MIN_NUMBER,
  max: number = MAX_NUMBER,
): number | null {
  const called = new Set(calledNumbers)
  const remaining: number[] = []
  for (let n = min; n <= max; n++) {
    if (!called.has(n)) remaining.push(n)
  }
  if (remaining.length === 0) return null
  return remaining[Math.floor(Math.random() * remaining.length)]
}
