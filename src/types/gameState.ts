import type { Timestamp, FieldValue } from 'firebase/firestore'
import { DEFAULT_STICKERS, type StickerConfig } from '../config/stickers'

/** A named, reusable custom win pattern saved by the admin. */
export interface SavedWinPattern {
  id: string
  name: string
  /** 25-bit row-major mask. */
  mask: number
}

// ---------------------------------------------------------------------------
// The single source of truth for the whole game, stored at game/state.
// Every screen subscribes to this document.
// ---------------------------------------------------------------------------

export interface GameState {
  /** Numbers called so far, in the order they were called. */
  calledNumbers: number[]
  /** Redo stack — numbers that were undone (last item = most recently undone). */
  undoneNumbers: number[]
  /** The number currently being shown big. */
  currentNumber: number | null
  /** Last 5 called numbers, newest first (always derived from calledNumbers). */
  recentNumbers: number[]

  prizeText: string
  showPrize: boolean

  winConditionText: string
  showWinCondition: boolean

  /** Chosen win-pattern preset id, 'custom', or null (legacy text-only mode). */
  winPatternId: string | null
  /** 25-bit row-major mask of highlighted cells (bit r*5+c). 0 = no pattern. */
  winPatternMask: number
  /** When true, render the animated mini bingo card under the win text. */
  showWinPattern: boolean
  /** Admin's named, reusable custom patterns. */
  customWinPatterns: SavedWinPattern[]

  specialMessage: string
  showSpecialMessage: boolean

  /** Sticker id to display, or null. */
  activeSticker: string | null

  /** Live, editable sticker/number config (managed from the Admin screen). */
  stickers: StickerConfig[]

  /** Master switch: when false, NO sticker pops by itself (manual only). */
  autoStickersEnabled: boolean

  /**
   * Global 0..1 "lucky chance": one roll per called number that, on a hit,
   * pops a RANDOM auto sticker. The single knob that drives surprise stickers
   * for the whole set (per-sticker `probability` still works on top of it).
   */
  globalLuckyChance: number

  /** Master switch: when false, viewers can't send floating emoji reactions. */
  reactionsEnabled: boolean

  /** Bumped on every "event" so all screens animate in sync. */
  animationNonce: number

  isPaused: boolean
  isWinnerCheckMode: boolean

  roundNumber: number

  /** Server timestamp of the last write. */
  updatedAt: Timestamp | FieldValue | null
}

/** A fresh, empty game. Used to create the doc and for "Reset Everything". */
export const DEFAULT_GAME_STATE: GameState = {
  calledNumbers: [],
  undoneNumbers: [],
  currentNumber: null,
  recentNumbers: [],

  prizeText: '',
  showPrize: false,

  winConditionText: 'לוח מלא — כל המספרים בכרטיס שלכם!',
  showWinCondition: false,

  winPatternId: null,
  winPatternMask: 0,
  showWinPattern: false,
  customWinPatterns: [],

  specialMessage: '',
  showSpecialMessage: false,

  activeSticker: null,

  stickers: DEFAULT_STICKERS,
  autoStickersEnabled: true,
  globalLuckyChance: 0,
  reactionsEnabled: true,

  animationNonce: 0,

  isPaused: false,
  isWinnerCheckMode: false,

  roundNumber: 1,

  updatedAt: null,
}

/**
 * Merge a raw Firestore document over the defaults so every field is always
 * present and the right type. This protects the screens from crashing on a
 * doc created by an older version (e.g. missing `stickers` or `recentNumbers`).
 */
export function normalizeGameState(raw: Partial<GameState> | null | undefined): GameState {
  const r = raw ?? {}
  const stickers =
    Array.isArray(r.stickers) && r.stickers.length > 0
      ? r.stickers
      : DEFAULT_GAME_STATE.stickers
  return {
    ...DEFAULT_GAME_STATE,
    ...r,
    calledNumbers: Array.isArray(r.calledNumbers) ? r.calledNumbers : [],
    undoneNumbers: Array.isArray(r.undoneNumbers) ? r.undoneNumbers : [],
    recentNumbers: Array.isArray(r.recentNumbers) ? r.recentNumbers : [],
    stickers,
    globalLuckyChance:
      typeof r.globalLuckyChance === 'number' && Number.isFinite(r.globalLuckyChance)
        ? Math.min(1, Math.max(0, r.globalLuckyChance))
        : 0,
    winPatternMask:
      typeof r.winPatternMask === 'number' && Number.isFinite(r.winPatternMask)
        ? r.winPatternMask & 0x1ffffff // clamp to 25 bits
        : 0,
    customWinPatterns: Array.isArray(r.customWinPatterns) ? r.customWinPatterns : [],
  }
}

export type { StickerConfig }
