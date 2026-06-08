import { motion } from 'framer-motion'

interface PrizeCardProps {
  prizeText: string
  size?: 'normal' | 'huge'
}

/** Shows the current prize. Render only when showPrize is true. */
export default function PrizeCard({ prizeText, size = 'normal' }: PrizeCardProps) {
  if (!prizeText.trim()) return null
  const huge = size === 'huge'

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass border-neon-yellow/30 text-center"
    >
      <div
        className={`font-display uppercase tracking-[0.2em] text-neon-yellow ${
          huge ? 'text-xl' : 'text-xs sm:text-sm'
        }`}
      >
        🎁 Prize
      </div>
      <div className={`mt-1 font-display font-bold ${huge ? 'text-4xl' : 'text-xl sm:text-2xl'}`}>
        {prizeText}
      </div>
    </motion.div>
  )
}
