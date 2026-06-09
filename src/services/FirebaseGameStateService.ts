import {
  doc,
  getDoc,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  type DocumentReference,
} from 'firebase/firestore'
import { db } from './firebase'
import { GAME_COLLECTION, GAME_DOC_ID, MAX_NUMBER, MIN_NUMBER } from '../config/gameConfig'
import { DEFAULT_GAME_STATE, normalizeGameState, type GameState } from '../types/gameState'
import { computeRecent, lastOf, pickRandomUncalled } from '../lib/bingo'
import { pickStickerForNumber } from '../lib/stickerPicker'
import type { StickerConfig } from '../config/stickers'

// ---------------------------------------------------------------------------
// FirebaseGameStateService
//
// The ONLY place the game document is written. Every mutation:
//   • reads the latest state (transaction) so synced clients don't clobber,
//   • recomputes derived fields (currentNumber, recentNumbers) from the source
//     arrays so undo/redo stay perfectly consistent,
//   • stamps updatedAt.
//
// animationNonce is bumped only on "events" worth animating (a number reveal
// or a manual sticker pop) — never on plain text/toggle edits — so screens
// don't fire confetti every time the admin types in the prize box.
// ---------------------------------------------------------------------------

const gameDocRef: DocumentReference = doc(db, GAME_COLLECTION, GAME_DOC_ID)

/** Live subscription. Returns an unsubscribe function. Always normalized. */
function subscribe(onChange: (state: GameState | null) => void): () => void {
  return onSnapshot(
    gameDocRef,
    (snap) => onChange(snap.exists() ? normalizeGameState(snap.data() as Partial<GameState>) : null),
    (err) => {
      console.error('[bingo] snapshot error:', err)
      onChange(null)
    },
  )
}

/** Create the doc with defaults if it doesn't exist yet. Safe to call often. */
async function ensureDoc(): Promise<void> {
  const snap = await getDoc(gameDocRef)
  if (!snap.exists()) {
    await setDoc(gameDocRef, { ...DEFAULT_GAME_STATE, updatedAt: serverTimestamp() })
  }
}

/**
 * Read-modify-write inside a transaction. The updater receives the current
 * state and returns a partial patch (without updatedAt — we add it).
 */
async function mutate(updater: (state: GameState) => Partial<GameState>): Promise<void> {
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(gameDocRef)
    const current: GameState = snap.exists()
      ? normalizeGameState(snap.data() as Partial<GameState>)
      : { ...DEFAULT_GAME_STATE }
    const patch = updater(current)
    tx.set(
      gameDocRef,
      { ...current, ...patch, updatedAt: serverTimestamp() },
      { merge: true },
    )
  })
}

// --- Number events --------------------------------------------------------

/** Mark a number as called. No-op if already called. Auto-picks a sticker. */
async function callNumber(n: number): Promise<void> {
  await mutate((s) => {
    if (s.calledNumbers.includes(n)) return {}
    const calledNumbers = [...s.calledNumbers, n]
    const sticker = pickStickerForNumber(n, s.stickers, s.autoStickersEnabled)
    return {
      calledNumbers,
      undoneNumbers: [], // calling a number clears the redo stack
      currentNumber: n,
      recentNumbers: computeRecent(calledNumbers),
      activeSticker: sticker ? sticker.id : null,
      animationNonce: s.animationNonce + 1,
    }
  })
}

/** Remove an already-called number (admin clicked it again & confirmed). */
async function removeNumber(n: number): Promise<void> {
  await mutate((s) => {
    if (!s.calledNumbers.includes(n)) return {}
    const calledNumbers = s.calledNumbers.filter((x) => x !== n)
    return {
      calledNumbers,
      currentNumber: lastOf(calledNumbers),
      recentNumbers: computeRecent(calledNumbers),
      animationNonce: s.animationNonce + 1,
    }
  })
}

/** Undo the last called number, pushing it onto the redo stack. */
async function undo(): Promise<void> {
  await mutate((s) => {
    if (s.calledNumbers.length === 0) return {}
    const calledNumbers = s.calledNumbers.slice(0, -1)
    const removed = s.calledNumbers[s.calledNumbers.length - 1]
    return {
      calledNumbers,
      undoneNumbers: [...s.undoneNumbers, removed],
      currentNumber: lastOf(calledNumbers),
      recentNumbers: computeRecent(calledNumbers),
      animationNonce: s.animationNonce + 1,
    }
  })
}

/** Redo: restore the most recently undone number. */
async function redo(): Promise<void> {
  await mutate((s) => {
    if (s.undoneNumbers.length === 0) return {}
    const restored = s.undoneNumbers[s.undoneNumbers.length - 1]
    const calledNumbers = [...s.calledNumbers, restored]
    return {
      calledNumbers,
      undoneNumbers: s.undoneNumbers.slice(0, -1),
      currentNumber: restored,
      recentNumbers: computeRecent(calledNumbers),
      animationNonce: s.animationNonce + 1,
    }
  })
}

/** Random Number button — call a random uncalled number. */
async function randomNumber(): Promise<void> {
  await mutate((s) => {
    const n = pickRandomUncalled(s.calledNumbers, MIN_NUMBER, MAX_NUMBER)
    if (n == null) return {}
    const calledNumbers = [...s.calledNumbers, n]
    const sticker = pickStickerForNumber(n, s.stickers, s.autoStickersEnabled)
    return {
      calledNumbers,
      undoneNumbers: [],
      currentNumber: n,
      recentNumbers: computeRecent(calledNumbers),
      activeSticker: sticker ? sticker.id : null,
      animationNonce: s.animationNonce + 1,
    }
  })
}

// --- Resets ---------------------------------------------------------------

/** Clear the board but KEEP prize, win condition and messages. */
async function resetBoard(): Promise<void> {
  await mutate((s) => ({
    calledNumbers: [],
    undoneNumbers: [],
    currentNumber: null,
    recentNumbers: [],
    activeSticker: null,
    animationNonce: s.animationNonce + 1,
  }))
}

/** Nuke everything back to defaults and start a new round. */
async function resetEverything(): Promise<void> {
  await mutate((s) => ({
    ...DEFAULT_GAME_STATE,
    stickers: s.stickers, // keep the admin's sticker setup
    autoStickersEnabled: s.autoStickersEnabled, // keep the master switch too
    roundNumber: (s.roundNumber ?? 1) + 1,
    animationNonce: s.animationNonce + 1,
  }))
}

// --- Plain field setters (no nonce bump → no confetti) --------------------

async function patch(fields: Partial<GameState>): Promise<void> {
  await updateDoc(gameDocRef, { ...fields, updatedAt: serverTimestamp() })
}

const setPrizeText = (v: string) => patch({ prizeText: v })
const setShowPrize = (v: boolean) => patch({ showPrize: v })
const setWinConditionText = (v: string) => patch({ winConditionText: v })
const setShowWinCondition = (v: boolean) => patch({ showWinCondition: v })
const setSpecialMessage = (v: string) => patch({ specialMessage: v })
const setShowSpecialMessage = (v: boolean) => patch({ showSpecialMessage: v })
const setWinnerCheckMode = (v: boolean) => patch({ isWinnerCheckMode: v })
const setPaused = (v: boolean) => patch({ isPaused: v })

/** Manually show a sticker (bumps nonce so it pops) or clear it (no pop). */
async function setActiveSticker(id: string | null): Promise<void> {
  await mutate((s) => ({
    activeSticker: id,
    // Only "pop" (bump nonce) when actually showing a sticker.
    ...(id ? { animationNonce: s.animationNonce + 1 } : {}),
  }))
}

// --- Sticker / number configuration ---------------------------------------

/** Replace the whole sticker config (admin Sticker & Number Manager). */
const saveStickers = (stickers: StickerConfig[]) => patch({ stickers })

/** Master switch: turn automated (self-popping) stickers on/off. */
const setAutoStickers = (v: boolean) => patch({ autoStickersEnabled: v })

export const FirebaseGameStateService = {
  subscribe,
  ensureDoc,
  callNumber,
  removeNumber,
  undo,
  redo,
  randomNumber,
  resetBoard,
  resetEverything,
  setPrizeText,
  setShowPrize,
  setWinConditionText,
  setShowWinCondition,
  setSpecialMessage,
  setShowSpecialMessage,
  setWinnerCheckMode,
  setPaused,
  setActiveSticker,
  saveStickers,
  setAutoStickers,
}
