import { motion } from 'framer-motion'
import { BINGO_COLUMNS } from '../config/gameConfig'

interface NumberBoardProps {
  calledNumbers: number[]
  currentNumber: number | null
  /** Bumped on every event — used to re-trigger the highlight pulse. */
  animationNonce: number
  /** When true (admin), tiles are clickable. */
  interactive?: boolean
  /** Click an uncalled number. */
  onCall?: (n: number) => void
  /** Click an already-called number (admin confirms removal). */
  onRemove?: (n: number) => void
  /** Smaller, denser tiles for the TV/display board. */
  compact?: boolean
}

const LETTER_COLORS = ['text-neon-pink', 'text-neon-purple', 'text-neon-blue', 'text-neon-green', 'text-neon-yellow']

/**
 * Standard B I N G O board: 5 columns (B I N G O), each a stack of its numbers.
 * Used on all three screens:
 *   • Admin — interactive (click to call / click again to remove)
 *   • Viewer / Display — read-only marker board
 */
export default function NumberBoard({
  calledNumbers,
  currentNumber,
  animationNonce,
  interactive = false,
  onCall,
  onRemove,
  compact = false,
}: NumberBoardProps) {
  const called = new Set(calledNumbers)

  return (
    <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
      {BINGO_COLUMNS.map((column, ci) => (
        <div key={column.letter} className="flex flex-col gap-1.5 sm:gap-2">
          {/* Column letter header */}
          <div
            className={`flex items-center justify-center rounded-lg bg-white/5 font-display font-extrabold ${
              compact ? 'py-1 text-xl' : 'py-1.5 text-2xl sm:text-3xl'
            } ${LETTER_COLORS[ci]}`}
          >
            {column.letter}
          </div>

          {column.numbers.map((n) => {
            const isCalled = called.has(n)
            const isCurrent = n === currentNumber

            const handleClick = () => {
              if (!interactive) return
              if (isCalled) onRemove?.(n)
              else onCall?.(n)
            }

            return (
              <motion.button
                // Re-key the current tile on every nonce so it re-pulses each call.
                key={isCurrent ? `${n}-${animationNonce}` : n}
                type="button"
                disabled={!interactive}
                onClick={handleClick}
                {...(isCurrent
                  ? {
                      animate: { scale: [1, 1.18, 1] },
                      transition: { duration: 0.6, ease: 'easeOut' as const },
                    }
                  : {})}
                className={[
                  'relative flex aspect-square items-center justify-center rounded-lg font-bold tabular-nums transition',
                  compact ? 'text-sm sm:text-base' : 'text-sm sm:text-lg',
                  interactive ? 'cursor-pointer' : 'cursor-default',
                  isCurrent
                    ? 'bg-gradient-to-br from-neon-pink to-neon-purple text-white shadow-neon-pink ring-2 ring-white/70'
                    : isCalled
                      ? 'bg-neon-purple/30 text-white ring-1 ring-neon-purple/60'
                      : interactive
                        ? 'bg-white/5 text-white/70 hover:bg-white/15 hover:text-white'
                        : 'bg-white/5 text-white/25',
                ].join(' ')}
              >
                {n}
              </motion.button>
            )
          })}
        </div>
      ))}
    </div>
  )
}
