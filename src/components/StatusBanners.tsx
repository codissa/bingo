import { motion } from 'framer-motion'
import type { GameState } from '../types/gameState'

interface StatusBannersProps {
  state: GameState
  size?: 'normal' | 'huge'
}

/** Paused / winner-check banners, shared across viewer & display. */
export default function StatusBanners({ state, size = 'normal' }: StatusBannersProps) {
  const huge = size === 'huge'
  const base = `glass text-center font-display font-bold ${huge ? 'text-3xl py-4' : 'text-lg'}`

  return (
    <>
      {state.isWinnerCheckMode && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${base} border-neon-yellow/40 bg-neon-yellow/10 text-neon-yellow animate-pulse-glow`}
        >
          🔍 Checking a winner… hold tight!
        </motion.div>
      )}
      {state.isPaused && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${base} border-neon-blue/40 bg-neon-blue/10 text-neon-blue`}
        >
          ⏸ Game paused
        </motion.div>
      )}
    </>
  )
}
