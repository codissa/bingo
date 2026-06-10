import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  CYCLING_VARIANTS,
  WIN_PRESETS_BY_ID,
  cellOn,
  deriveOrder,
} from '../config/winConditions'

interface WinPatternCardProps {
  /** 25-bit row-major mask of highlighted cells. 0 → renders nothing. */
  mask: number
  /** Preset id (drives the nice sweep order + "any line" cycling). */
  patternId?: string | null
  size?: 'normal' | 'huge'
}

/** Full glow cycle length. One gentle crest glides through the whole pattern. */
const LOOP_MS = 3200
/** How long the card holds each line before cycling to the next variant. */
const CYCLE_MS = 2600

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/**
 * Animated mini 5×5 bingo card. A warm neon crest sweeps cell-to-cell along the
 * pattern. For "any row/col/line" presets it cycles through each qualifying
 * line. Composed beneath WinConditionCard on the viewer & display screens.
 */
export default function WinPatternCard({ mask, patternId, size = 'normal' }: WinPatternCardProps) {
  const variants = patternId ? CYCLING_VARIANTS[patternId] : undefined
  const cycling = !!variants && variants.length > 1 && !prefersReducedMotion()

  const [step, setStep] = useState(0)
  useEffect(() => {
    if (!cycling) return
    const id = setInterval(() => setStep((s) => s + 1), CYCLE_MS)
    return () => clearInterval(id)
  }, [cycling])

  if (!mask) return null

  const activeMask = cycling && variants ? variants[step % variants.length] : mask

  // Sweep order: explicit preset path for fixed shapes, else row-major.
  const order =
    !cycling && patternId ? WIN_PRESETS_BY_ID[patternId]?.sweepPath ?? deriveOrder(activeMask)
      : deriveOrder(activeMask)
  const n = order.length
  const posOf = new Map(order.map((cell, i) => [cell, i]))

  const huge = size === 'huge'
  const cell = huge ? 'h-10 w-10 lg:h-12 lg:w-12' : 'h-6 w-6 sm:h-7 sm:w-7'
  const gap = huge ? 'gap-1.5' : 'gap-1'
  const radius = huge ? 'rounded-lg' : 'rounded-md'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass flex flex-col items-center gap-2 border-neon-orange/30"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={cycling ? step % (variants?.length ?? 1) : 'static'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className={`grid grid-cols-5 ${gap}`}
          style={{ ['--win-flow-loop' as string]: `${LOOP_MS}ms` }}
        >
          {Array.from({ length: 25 }, (_, i) => {
            const on = cellOn(activeMask, i)
            const pos = posOf.get(i)
            return (
              <div
                key={i}
                className={`${cell} ${radius} ${
                  on
                    ? 'ring-1 ring-neon-orange/40 animate-win-flow'
                    : 'bg-white/5'
                }`}
                style={
                  on && pos != null
                    ? // Spread one full cycle across the pattern; negative delay
                      // so the wave is already mid-motion on first paint.
                      { animationDelay: `${-(LOOP_MS * pos) / n}ms` }
                    : undefined
                }
              />
            )
          })}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}
