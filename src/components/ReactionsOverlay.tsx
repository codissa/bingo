import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ReactionsService, type IncomingReaction } from '../services/ReactionsService'
import { REACTION_FLOAT_MS, REACTION_MAX_CONCURRENT } from '../config/reactions'

// ---------------------------------------------------------------------------
// ReactionsOverlay — a full-screen, non-interactive layer that floats viewer
// reaction emojis up the screen and fades them out. Mounted on Viewer and
// Display so the whole crowd sees the same reactions in real time.
//
// Sits BELOW the number reveal (RevealOverlay), so a reveal always wins the
// foreground and the game is never obstructed.
// ---------------------------------------------------------------------------

interface Floater extends IncomingReaction {
  /** Unique render key (Firestore ids can't collide, local ids are counter-based). */
  key: string
  /** Horizontal lane as a percentage of viewport width. */
  left: number
  /** Random sway + scale so a burst doesn't look like a marching column. */
  drift: number
  scale: number
}

let seq = 0

export default function ReactionsOverlay({ enabled }: { enabled: boolean }) {
  const [floaters, setFloaters] = useState<Floater[]>([])

  // Keep the latest `enabled` readable inside the (once-mounted) subscription
  // callbacks without resubscribing on every toggle.
  const enabledRef = useRef(enabled)
  useEffect(() => {
    enabledRef.current = enabled
    // When the admin turns reactions off, clear anything still floating.
    if (!enabled) setFloaters([])
  }, [enabled])

  useEffect(() => {
    const spawn = (r: IncomingReaction) => {
      if (!enabledRef.current) return
      const f: Floater = {
        ...r,
        key: `${r.id}-${(seq += 1)}`,
        left: 8 + Math.random() * 84, // keep clear of the very edges
        drift: (Math.random() - 0.5) * 80, // px of horizontal sway
        scale: 0.9 + Math.random() * 0.6,
      }
      setFloaters((prev) => {
        const next = [...prev, f]
        // Drop oldest overflow so a tap-storm can't pile up and lag the screen.
        return next.length > REACTION_MAX_CONCURRENT
          ? next.slice(next.length - REACTION_MAX_CONCURRENT)
          : next
      })
    }

    const unsubRemote = ReactionsService.subscribeReactions(spawn)
    const unsubLocal = ReactionsService.subscribeLocal(spawn)
    return () => {
      unsubRemote()
      unsubLocal()
    }
  }, [])

  const remove = (key: string) =>
    setFloaters((prev) => prev.filter((f) => f.key !== key))

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      <AnimatePresence>
        {floaters.map((f) => (
          <motion.span
            key={f.key}
            className="absolute bottom-24 select-none text-5xl drop-shadow-[0_0_14px_rgba(168,85,247,0.5)] sm:text-6xl"
            style={{ left: `${f.left}%` }}
            initial={{ y: 0, x: 0, opacity: 0, scale: 0.3 }}
            animate={{
              y: '-78vh',
              x: f.drift,
              opacity: [0, 1, 1, 0],
              scale: f.scale,
              rotate: f.drift * 0.15,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: REACTION_FLOAT_MS / 1000, ease: 'easeOut' }}
            onAnimationComplete={() => remove(f.key)}
          >
            {f.emoji}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  )
}
