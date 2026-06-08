import { AnimatePresence, motion } from 'framer-motion'
import { letterFor } from '../lib/bingo'

interface CurrentNumberDisplayProps {
  currentNumber: number | null
  animationNonce: number
  /** Bigger styling for the TV/projector display screen. */
  size?: 'normal' | 'huge'
}

/**
 * The big dramatic reveal of the current number. Re-animates whenever
 * animationNonce changes (keyed), giving a zoom + glow each call.
 */
export default function CurrentNumberDisplay({
  currentNumber,
  animationNonce,
  size = 'normal',
}: CurrentNumberDisplayProps) {
  const huge = size === 'huge'

  return (
    <div className="flex flex-col items-center justify-center">
      <span
        className={`font-display font-bold uppercase tracking-[0.3em] text-white/50 ${
          huge ? 'text-2xl' : 'text-sm sm:text-base'
        }`}
      >
        {currentNumber != null ? `Letter ${letterFor(currentNumber)}` : 'Waiting…'}
      </span>

      <div
        className={`relative flex items-center justify-center ${
          huge ? 'h-[42vh] min-h-[260px]' : 'h-44 sm:h-56'
        }`}
      >
        <AnimatePresence mode="popLayout">
          <motion.div
            key={`${currentNumber}-${animationNonce}`}
            initial={{ scale: 0.2, opacity: 0, rotate: -8 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 240, damping: 16 }}
            className="absolute"
          >
            <span
              className={`block select-none font-display font-extrabold leading-none neon-text drop-shadow-[0_0_35px_rgba(168,85,247,0.55)] ${
                huge ? 'text-[34vh]' : 'text-[8rem] sm:text-[11rem]'
              }`}
            >
              {currentNumber ?? '—'}
            </span>
          </motion.div>
        </AnimatePresence>

        {/* Pulsing glow ring behind the number */}
        {currentNumber != null && (
          <div
            className="pointer-events-none absolute inset-0 -z-10 animate-pulse-glow rounded-full blur-3xl"
            style={{
              background:
                'radial-gradient(circle, rgba(255,61,181,0.35), rgba(56,189,248,0.18) 55%, transparent 70%)',
            }}
          />
        )}
      </div>
    </div>
  )
}
