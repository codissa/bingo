import {
  addDoc,
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  type CollectionReference,
  type Timestamp as FsTimestamp,
} from 'firebase/firestore'
import { db } from './firebase'
import {
  REACTIONS_COLLECTION,
  REACTION_EMOJIS,
  REACTION_FRESH_MS,
  REACTION_TTL_MS,
  type ReactionEmoji,
} from '../config/reactions'

// ---------------------------------------------------------------------------
// ReactionsService
//
// The ONLY place the `reactions` collection is touched. Each viewer tap writes
// one tiny, short-lived doc { emoji, createdAt, expireAt }. All screens
// subscribe and animate each genuinely-new reaction as a floating emoji.
//
// Deliberately independent of FirebaseGameStateService / game/state, so crowd
// reactions never obstruct or interfere with the game itself.
// ---------------------------------------------------------------------------

const reactionsRef = collection(db, REACTIONS_COLLECTION) as CollectionReference

const isValidEmoji = (e: string): e is ReactionEmoji =>
  (REACTION_EMOJIS as readonly string[]).includes(e)

/** A reaction surfaced to the UI to animate. */
export interface IncomingReaction {
  id: string
  emoji: string
}

// Local optimistic channel: lets the tapping client show its own emoji
// instantly without waiting for the Firestore round-trip.
const localListeners = new Set<(r: IncomingReaction) => void>()
let localCounter = 0

/** Subscribe to this client's own optimistic reactions. */
function subscribeLocal(onReaction: (r: IncomingReaction) => void): () => void {
  localListeners.add(onReaction)
  return () => localListeners.delete(onReaction)
}

/** Send a reaction. No-op (rejected) if the emoji isn't in the allowed set. */
async function sendReaction(emoji: string): Promise<void> {
  if (!isValidEmoji(emoji)) return
  // Optimistic local float — instant feedback for the sender.
  const localId = `local-${(localCounter += 1)}`
  localListeners.forEach((l) => l({ id: localId, emoji }))
  await addDoc(reactionsRef, {
    emoji,
    createdAt: serverTimestamp(),
    // Stamped client-side so a Firestore TTL policy on `expireAt` can clean up.
    expireAt: Timestamp.fromMillis(Date.now() + REACTION_TTL_MS),
  })
}

/**
 * Live subscription to incoming reactions. Calls `onReaction` once per new
 * reaction. Skips the initial backlog (first snapshot) and any doc older than
 * REACTION_FRESH_MS so a late-joining client doesn't replay history at once.
 * Returns an unsubscribe function.
 */
function subscribeReactions(onReaction: (r: IncomingReaction) => void): () => void {
  const q = query(reactionsRef, orderBy('createdAt', 'desc'), limit(40))
  let primed = false

  return onSnapshot(
    q,
    (snap) => {
      // First snapshot = existing backlog. Ignore it; only animate what's new.
      if (!primed) {
        primed = true
        return
      }
      for (const change of snap.docChanges()) {
        if (change.type !== 'added') continue
        const data = change.doc.data()
        const emoji = typeof data.emoji === 'string' ? data.emoji : null
        if (!emoji) continue
        // serverTimestamp() is briefly null on the writer's optimistic local
        // snapshot — treat that as "fresh" (it just happened).
        const createdAt = data.createdAt as FsTimestamp | null
        if (createdAt && Date.now() - createdAt.toMillis() > REACTION_FRESH_MS) continue
        onReaction({ id: change.doc.id, emoji })
      }
    },
    (err) => console.error('[bingo] reactions snapshot error:', err),
  )
}

export const ReactionsService = {
  sendReaction,
  subscribeReactions,
  subscribeLocal,
}
