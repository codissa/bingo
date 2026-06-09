// ---------------------------------------------------------------------------
// Reactions configuration — the floating emoji viewers can send.
//
// Reactions live in their OWN Firestore collection, completely separate from
// the single game/state document. This keeps the read-only game untouched:
// many viewers tapping reactions never contend with the admin's transactional
// number writes, and never bump animationNonce (no surprise confetti).
// ---------------------------------------------------------------------------

/** Firestore collection holding short-lived reaction docs. */
export const REACTIONS_COLLECTION = 'reactions'

/** The emojis viewers can tap. Only these are accepted by the service. */
export const REACTION_EMOJIS = ['❤️', '🔥', '👏', '😂', '🎉', '😮', '😢'] as const

export type ReactionEmoji = (typeof REACTION_EMOJIS)[number]

/** Min gap between sends from a single client (ms) — anti-spam throttle. */
export const REACTION_THROTTLE_MS = 250

/** How long one emoji floats up the screen before it's removed (ms). */
export const REACTION_FLOAT_MS = 2600

/**
 * Ignore reaction docs older than this on arrival (ms). Stops a late-joining
 * client from replaying the whole recent backlog as a burst on first load.
 */
export const REACTION_FRESH_MS = 8000

/** TTL stamp: reaction docs expire this long after creation (ms). */
export const REACTION_TTL_MS = 60_000

/** Hard cap on concurrent floaters on screen so a tap-storm can't lag it. */
export const REACTION_MAX_CONCURRENT = 40
