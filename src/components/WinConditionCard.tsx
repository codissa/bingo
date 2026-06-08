import { motion } from 'framer-motion'

interface WinConditionCardProps {
  winConditionText: string
  size?: 'normal' | 'huge'
}

/** Shows what you need to win this round. Render only when showWinCondition. */
export default function WinConditionCard({ winConditionText, size = 'normal' }: WinConditionCardProps) {
  if (!winConditionText.trim()) return null
  const huge = size === 'huge'

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass border-neon-green/30 text-center"
    >
      <div
        className={`font-display uppercase tracking-[0.2em] text-neon-green ${
          huge ? 'text-xl' : 'text-xs sm:text-sm'
        }`}
      >
        🏆 To Win
      </div>
      <div className={`mt-1 font-semibold ${huge ? 'text-3xl' : 'text-lg sm:text-xl'}`}>
        {winConditionText}
      </div>
    </motion.div>
  )
}
