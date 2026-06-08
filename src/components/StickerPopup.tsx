import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { getStickerById, type StickerConfig } from '../config/stickers'
import { STICKER_DURATION_MS } from '../config/gameConfig'

interface StickerPopupProps {
  activeSticker: string | null
  /** Live sticker config from game state (so all screens match). */
  stickers: StickerConfig[]
  /** Bumped on every event — drives when the popup (re)appears. */
  animationNonce: number
  size?: 'normal' | 'huge'
}

/**
 * Pops the active sticker whenever animationNonce changes (so it re-shows on
 * each new number / manual trigger), then auto-dismisses. The sticker is
 * chosen server-side (in the service) so every screen shows the same one.
 * Shows the image if set, otherwise the emoji.
 */
export default function StickerPopup({
  activeSticker,
  stickers,
  animationNonce,
  size = 'normal',
}: StickerPopupProps) {
  const [shown, setShown] = useState<StickerConfig | null>(null)
  const [imgFailed, setImgFailed] = useState(false)
  const lastNonce = useRef<number | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // Ignore the initial value so we don't pop on first load.
    if (lastNonce.current === null) {
      lastNonce.current = animationNonce
      return
    }
    if (animationNonce === lastNonce.current) return
    lastNonce.current = animationNonce

    const sticker = getStickerById(activeSticker, stickers)
    if (!sticker) return

    setImgFailed(false)
    setShown(sticker)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setShown(null), STICKER_DURATION_MS)
  }, [animationNonce, activeSticker, stickers])

  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), [])

  const huge = size === 'huge'
  const useImage = shown?.image && !imgFailed

  return (
    <AnimatePresence>
      {shown && (
        <motion.div
          key={`${shown.id}-${animationNonce}`}
          className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0, rotate: -15, y: 40 }}
            animate={{ scale: 1, rotate: 0, y: 0 }}
            exit={{ scale: 0, rotate: 12, y: 40 }}
            transition={{ type: 'spring', stiffness: 260, damping: 14 }}
            className="flex flex-col items-center"
          >
            {useImage ? (
              <img
                src={shown.image}
                alt={shown.label}
                onError={() => setImgFailed(true)}
                className={`drop-shadow-[0_0_30px_rgba(168,85,247,0.6)] ${
                  huge ? 'h-72 w-72' : 'h-44 w-44 sm:h-52 sm:w-52'
                } object-contain`}
              />
            ) : (
              <span className={`drop-shadow-[0_0_30px_rgba(168,85,247,0.6)] ${huge ? 'text-[16rem]' : 'text-[8rem]'}`}>
                {shown.emoji ?? '🎉'}
              </span>
            )}
            {shown.message && (
              <div
                className={`glass mt-2 px-5 py-2 text-center font-display font-bold ${
                  huge ? 'text-3xl' : 'text-xl'
                }`}
              >
                {shown.message}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
