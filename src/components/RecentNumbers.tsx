import { AnimatePresence, motion } from 'framer-motion'

interface RecentNumbersProps {
  /** Already newest-first (the gameState.recentNumbers invariant). */
  recentNumbers: number[]
  size?: 'normal' | 'huge'
}

/** The last 5 called numbers, newest first, with a slide-in animation. */
export default function RecentNumbers({ recentNumbers, size = 'normal' }: RecentNumbersProps) {
  const huge = size === 'huge'

  return (
    <div className="flex flex-col items-center gap-2">
      <span
        className={`font-display uppercase tracking-[0.25em] text-white/50 ${
          huge ? 'text-xl' : 'text-xs sm:text-sm'
        }`}
      >
        Recent
      </span>
      <div className={`flex flex-wrap items-center justify-center ${huge ? 'gap-4' : 'gap-2 sm:gap-3'}`}>
        <AnimatePresence mode="popLayout" initial={false}>
          {recentNumbers.length === 0 && (
            <span className="text-white/30">No numbers yet</span>
          )}
          {recentNumbers.map((n, i) => (
            <motion.div
              key={n}
              layout
              initial={{ scale: 0, opacity: 0, y: -12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className={[
                'flex items-center justify-center rounded-full font-display font-bold tabular-nums',
                i === 0
                  ? 'bg-gradient-to-br from-neon-pink to-neon-purple text-white shadow-neon'
                  : 'bg-white/10 text-white/80',
                huge
                  ? i === 0
                    ? 'h-24 w-24 text-4xl'
                    : 'h-20 w-20 text-3xl'
                  : i === 0
                    ? 'h-14 w-14 text-2xl sm:h-16 sm:w-16'
                    : 'h-11 w-11 text-lg sm:h-12 sm:w-12',
              ].join(' ')}
            >
              {n}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
