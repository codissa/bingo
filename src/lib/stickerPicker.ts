import type { StickerConfig } from '../config/stickers'

// ---------------------------------------------------------------------------
// Decide which sticker (if any) pops automatically when a number is called.
//   • Only "auto" stickers are considered here ("manual" = button only).
//   • If the master switch `autoEnabled` is off, nothing auto-pops.
//   1. A sticker whose triggerNumbers include this number wins.
//   2. Otherwise, roll each sticker's `probability` and maybe return one.
//   3. Otherwise return null (no sticker this time).
// ---------------------------------------------------------------------------

export function pickStickerForNumber(
  calledNumber: number | null,
  stickers: StickerConfig[],
  autoEnabled: boolean,
): StickerConfig | null {
  if (calledNumber == null || !autoEnabled) return null

  const auto = stickers.filter((s) => s.mode === 'auto')

  // 1. Trigger match takes priority.
  const triggered = auto.find((s) => s.triggerNumbers?.includes(calledNumber))
  if (triggered) return triggered

  // 2. Random roll. Gather everyone who "hits" this roll, pick one at random.
  const lucky = auto.filter((s) => s.probability != null && Math.random() < s.probability)
  if (lucky.length > 0) {
    return lucky[Math.floor(Math.random() * lucky.length)]
  }

  // 3. Nothing this time.
  return null
}
