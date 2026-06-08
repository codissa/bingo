import { motion } from 'framer-motion'

interface SpecialMessageCardProps {
  specialMessage: string
  size?: 'normal' | 'huge'
}

/** A free-text shout-out / announcement. Render only when showSpecialMessage. */
export default function SpecialMessageCard({ specialMessage, size = 'normal' }: SpecialMessageCardProps) {
  if (!specialMessage.trim()) return null
  const huge = size === 'huge'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass border-neon-blue/30 bg-neon-blue/10 text-center"
    >
      <div className={`font-display font-bold ${huge ? 'text-3xl' : 'text-lg sm:text-xl'}`}>
        📣 {specialMessage}
      </div>
    </motion.div>
  )
}
