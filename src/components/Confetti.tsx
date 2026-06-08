import { useEffect, useRef } from 'react'
import confetti from 'canvas-confetti'

interface ConfettiProps {
  /** Fire a burst whenever this value changes. */
  trigger: number
  /** Bigger, longer burst for the TV/display. */
  intensity?: 'normal' | 'big'
  /** Don't fire on the very first render / initial state load. */
  active?: boolean
}

/**
 * Fires canvas-confetti whenever `trigger` (the animationNonce) changes.
 * Mounted on Viewer and Display so every number reveal celebrates.
 */
export default function Confetti({ trigger, intensity = 'normal', active = true }: ConfettiProps) {
  const lastTrigger = useRef<number | null>(null)

  useEffect(() => {
    // Skip the first observed value so we don't blast confetti on page load.
    if (lastTrigger.current === null) {
      lastTrigger.current = trigger
      return
    }
    if (trigger === lastTrigger.current) return
    lastTrigger.current = trigger
    if (!active) return

    const big = intensity === 'big'
    const colors = ['#ff3db5', '#a855f7', '#38bdf8', '#34d399', '#fde047']

    confetti({
      particleCount: big ? 160 : 90,
      spread: big ? 110 : 80,
      startVelocity: big ? 55 : 45,
      origin: { y: 0.6 },
      colors,
    })
    // Side cannons for extra drama on the big screen.
    if (big) {
      confetti({ particleCount: 80, angle: 60, spread: 70, origin: { x: 0 }, colors })
      confetti({ particleCount: 80, angle: 120, spread: 70, origin: { x: 1 }, colors })
    }
  }, [trigger, intensity, active])

  return null
}
