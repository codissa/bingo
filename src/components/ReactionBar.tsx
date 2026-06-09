import { useRef } from 'react'
import { ReactionsService } from '../services/ReactionsService'
import { REACTION_EMOJIS, REACTION_THROTTLE_MS } from '../config/reactions'

// ---------------------------------------------------------------------------
// ReactionBar — the row of tappable reaction emojis on the viewer's phone.
// Sends a reaction (with a small per-client throttle) that floats up on every
// screen via ReactionsOverlay. The sender sees their own emoji instantly via
// the service's optimistic local channel.
// ---------------------------------------------------------------------------

export default function ReactionBar() {
  const lastSent = useRef(0)

  const send = (emoji: string) => {
    const now = Date.now()
    if (now - lastSent.current < REACTION_THROTTLE_MS) return
    lastSent.current = now
    ReactionsService.sendReaction(emoji).catch((err) =>
      console.error('[bingo] sendReaction failed:', err),
    )
  }

  return (
    <div className="pointer-events-auto fixed inset-x-0 bottom-0 z-[70] flex justify-center px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3">
      <div className="flex max-w-full gap-1.5 overflow-x-auto rounded-2xl border border-white/15 bg-ink/70 px-2.5 py-2 backdrop-blur-md">
        {REACTION_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            aria-label={`Send ${emoji} reaction`}
            onClick={() => send(emoji)}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-2xl transition active:scale-90 hover:bg-white/10"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  )
}
