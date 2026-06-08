import type { Timestamp, FieldValue } from 'firebase/firestore'
import { DEFAULT_STICKERS, type StickerConfig } from '../config/stickers'

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

  specialMessage: string
  showSpecialMessage: boolean

  /** Sticker id to display, or null. */
  activeSticker: string | null

  /** Live, editable sticker/number config (managed from the Admin screen). */
  stickers: StickerConfig[]

  /** Master switch: when false, NO sticker pops by itself (manual only). */
  autoStickersEnabled: boolean

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

  winConditionText: 'Full house — every number on your card!',
  showWinCondition: false,

  specialMessage: '',
  showSpecialMessage: false,

  activeSticker: null,

  stickers: DEFAULT_STICKERS,
  autoStickersEnabled: true,

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
  }
}

export type { StickerConfig }
