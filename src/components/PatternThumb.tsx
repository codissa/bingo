import { cellOn } from '../config/winConditions'

interface PatternThumbProps {
  mask: number
}

/** Tiny static 5×5 preview of a mask — used in the admin preset gallery. */
export default function PatternThumb({ mask }: PatternThumbProps) {
  return (
    <div className="grid grid-cols-5 gap-0.5">
      {Array.from({ length: 25 }, (_, i) => (
        <div
          key={i}
          className={`h-2 w-2 rounded-[2px] ${
            cellOn(mask, i) ? 'bg-neon-orange shadow-[0_0_4px_rgba(251,146,60,0.8)]' : 'bg-white/10'
          }`}
        />
      ))}
    </div>
  )
}
