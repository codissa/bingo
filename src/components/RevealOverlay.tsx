import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { getStickerById, type StickerConfig } from '../config/stickers'
import { DISCO_DURATION_MS, STICKER_DURATION_MS } from '../config/gameConfig'
import { letterFor } from '../lib/bingo'
import { usePreloadImages } from '../lib/usePreloadImages'

/** Neon palette shared with the confetti burst. */
const DISCO_COLORS = ['#ff3db5', '#a855f7', '#38bdf8', '#34d399', '#fde047']

/** Extra confetti when a disco (bingo-win) sticker pops, on top of the normal burst. */
function fireDiscoConfetti() {
  confetti({ particleCount: 200, spread: 130, startVelocity: 55, origin: { y: 0.6 }, colors: DISCO_COLORS })
  confetti({ particleCount: 100, angle: 60, spread: 80, origin: { x: 0 }, colors: DISCO_COLORS })
  confetti({ particleCount: 100, angle: 120, spread: 80, origin: { x: 1 }, colors: DISCO_COLORS })
}

interface RevealOverlayProps {
  currentNumber: number | null
  activeSticker: string | null
  /** Live sticker config from game state (so all screens match). */
  stickers: StickerConfig[]
  /** Bumped on every event — drives when the reveal fires. */
  animationNonce: number
  size?: 'normal' | 'huge'
}

/** How long a number-only pop stays before fading (stickers stay longer). */
const NUMBER_ONLY_MS = 1800

interface Reveal {
  number: number | null
  sticker: StickerConfig | null
}

/**
 * The combined "pop" moment, shown on Viewer & Display.
 *   • The NUMBER is the hero — it pops big in the centre on every called number.
 *   • If a sticker fired, it pops right beside/above the number with its message
 *     (they never cover each other).
 *   • A soft scrim fades the page back during the pop, then it auto-dismisses.
 * Pointer-events-none so taps pass straight through to the page underneath.
 */
export default function RevealOverlay({
  currentNumber,
  activeSticker,
  stickers,
  animationNonce,
  size = 'normal',
}: RevealOverlayProps) {
  const [reveal, setReveal] = useState<Reveal | null>(null)
  const [imgFailed, setImgFailed] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)
  const lastNonce = useRef<number | null>(null)

  // Warm the browser cache for every sticker image in the live config, so a
  // reveal paints instantly instead of fetching on-demand. Covers stickers
  // added later from the Admin screen automatically.
  usePreloadImages(stickers)
  const prevNumber = useRef<number | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // Ignore the initial value so we don't pop on first load.
    if (lastNonce.current === null) {
      lastNonce.current = animationNonce
      prevNumber.current = currentNumber
      return
    }
    if (animationNonce === lastNonce.current) return
    lastNonce.current = animationNonce

    // Did the called number actually change this event? If not, this was a
    // manual sticker trigger — show the sticker alone (don't re-pop the number).
    const numberChanged = currentNumber !== prevNumber.current
    prevNumber.current = currentNumber

    const sticker = getStickerById(activeSticker, stickers)
    const revealNumber = numberChanged ? currentNumber : null

    // Nothing to celebrate (e.g. after a reset, or a no-op).
    if (revealNumber == null && !sticker) return

    setImgFailed(false)
    setImgLoaded(false)
    setReveal({ number: revealNumber, sticker })

    // The disco (bingo-win) sticker gets an extra confetti blast and a longer stay.
    if (sticker?.disco) fireDiscoConfetti()
    const duration = sticker
      ? sticker.disco
        ? DISCO_DURATION_MS
        : STICKER_DURATION_MS
      : NUMBER_ONLY_MS

    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setReveal(null), duration)
  }, [animationNonce, activeSticker, currentNumber, stickers])

  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), [])

  const huge = size === 'huge'
  const sticker = reveal?.sticker ?? null
  const useImage = sticker?.image && !imgFailed
  const isDisco = sticker?.disco === true

  return (
    <AnimatePresence>
      {reveal && (
        <motion.div
          key={animationNonce}
          className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Soft scrim — page recedes during the pop, then returns. */}
          <div className={`absolute inset-0 backdrop-blur-sm ${huge ? 'bg-ink/60' : 'bg-ink/40'}`} />

          {/* Disco lights — spinning multi-colour wash over the scrim. */}
          {isDisco && <div className="disco-lights" />}

          <div className="relative flex flex-col items-center">
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-8">
              {/* Sticker (above on mobile, beside on >= sm) */}
              {sticker && (
                <motion.div
                  initial={{ scale: 0, y: 30, rotate: -14 }}
                  animate={{ scale: 1, y: 0, rotate: 0 }}
                  exit={{ scale: 0, rotate: 12 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.05 }}
                >
                  {/* Disco: spin + pulse forever after the pop-in. Regular stickers
                      stay still (inner div has no animation). */}
                  <motion.div
                    animate={isDisco ? { rotate: [0, 360], scale: [1, 1.15, 1] } : undefined}
                    transition={
                      isDisco
                        ? {
                            rotate: { repeat: Infinity, duration: 1.4, ease: 'linear' },
                            scale: { repeat: Infinity, duration: 0.7, ease: 'easeInOut' },
                          }
                        : undefined
                    }
                  >
                    {useImage ? (
                      <img
                        // If the image is already cached (the usual case once
                        // preloaded), onLoad may fire before React attaches its
                        // handler — so check `complete` on mount too, else it'd
                        // stay invisible forever.
                        ref={(el) => {
                          if (el?.complete) setImgLoaded(true)
                        }}
                        src={sticker.image}
                        alt={sticker.label}
                        decoding="async"
                        onLoad={() => setImgLoaded(true)}
                        onError={() => setImgFailed(true)}
                        style={{
                          opacity: imgLoaded ? 1 : 0,
                          transition: 'opacity 150ms ease-out',
                        }}
                        className={`object-contain drop-shadow-[0_0_30px_rgba(168,85,247,0.6)] ${
                          isDisco ? 'animate-disco-hue' : ''
                        } ${huge ? 'h-64 w-64' : 'h-36 w-36 sm:h-44 sm:w-44'}`}
                      />
                    ) : (
                      <span
                        className={`block drop-shadow-[0_0_30px_rgba(168,85,247,0.6)] ${
                          isDisco ? 'animate-disco-hue' : ''
                        } ${huge ? 'text-[14rem] leading-none' : 'text-[6rem] leading-none sm:text-[7rem]'}`}
                      >
                        {sticker.emoji ?? '🎉'}
                      </span>
                    )}
                  </motion.div>
                </motion.div>
              )}

              {/* Number — the hero */}
              {reveal.number != null && (
                <div className="flex flex-col items-center">
                  <span
                    className={`font-display font-bold uppercase tracking-[0.3em] text-white/60 ${
                      huge ? 'text-3xl' : 'text-base sm:text-xl'
                    }`}
                  >
                    {letterFor(reveal.number)}
                  </span>
                  <motion.span
                    initial={{ scale: 0.2, rotate: -8, opacity: 0 }}
                    animate={{ scale: [0.2, 1.12, 1], rotate: 0, opacity: 1 }}
                    exit={{ scale: 0.4, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 240, damping: 14 }}
                    className={`block select-none font-display font-extrabold leading-none neon-text drop-shadow-[0_0_45px_rgba(168,85,247,0.6)] ${
                      huge ? 'text-[26vh]' : 'text-[7rem] sm:text-[9rem]'
                    }`}
                  >
                    {reveal.number}
                  </motion.span>
                </div>
              )}
            </div>

            {/* Message below */}
            {sticker?.message && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.18 }}
                className={`glass mt-4 px-6 py-2 text-center font-display font-bold ${
                  huge ? 'text-3xl' : 'text-xl'
                }`}
              >
                {sticker.message}
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
