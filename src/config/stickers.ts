// ---------------------------------------------------------------------------
// STICKER CONFIG  🎉
//
// These are the DEFAULTS that seed the game the first time it runs. After that,
// you can edit everything live from the Admin screen (Sticker & Number Manager):
//   • add stickers / emojis
//   • choose which NUMBERS trigger which sticker
//   • set each sticker to "Auto" (pops by itself) or "Manual" (button only)
//   • flip the master "Automated stickers" switch off entirely
//
// To use your own picture instead of an emoji:
//   1. Drop an image into  public/stickers/   (png / jpg / gif / svg)
//   2. Set the sticker's `image` to e.g. '/stickers/akela-dab.png'
//   3. If the image is missing, the `emoji` shows as a fallback.
// ---------------------------------------------------------------------------

/** How a sticker is allowed to fire. */
export type StickerMode = 'auto' | 'manual'

export interface StickerConfig {
  /** Unique id. */
  id: string
  /** Short label shown in admin buttons / under the sticker. */
  label: string
  /** Emoji shown if there's no image (and as the quick "emoji sticker"). */
  emoji?: string
  /** Optional image under /public (e.g. '/stickers/owl.svg'). Beats emoji. */
  image?: string
  /** Numbers that make this sticker pop (when mode = auto). */
  triggerNumbers: number[]
  /** 0..1 chance to randomly pop on ANY number (when mode = auto). */
  probability?: number
  /** Optional funny caption shown with the sticker. */
  message?: string
  /** 'auto' = pops on its own (triggers/random). 'manual' = button only. */
  mode: StickerMode
}

export const DEFAULT_STICKERS: StickerConfig[] = [
  {
    id: 'campfire',
    label: 'Campfire',
    emoji: '🔥',
    image: '/stickers/campfire.svg',
    triggerNumbers: [7, 70],
    probability: 0.08,
    message: 'Gather round! 🔥',
    mode: 'auto',
  },
  {
    id: 'badge',
    label: 'Merit Badge',
    emoji: '🏅',
    image: '/stickers/badge.svg',
    triggerNumbers: [1, 10],
    probability: 0.06,
    message: 'Badge unlocked!',
    mode: 'auto',
  },
  {
    id: 'owl',
    label: 'Wise Owl',
    emoji: '🦉',
    image: '/stickers/owl.svg',
    triggerNumbers: [22],
    probability: 0.05,
    message: 'Twit twoo, who knew?',
    mode: 'auto',
  },
  {
    id: 'tent',
    label: 'Camp Tent',
    emoji: '⛺',
    image: '/stickers/tent.svg',
    triggerNumbers: [13, 30],
    probability: 0.05,
    message: 'Pitch perfect!',
    mode: 'auto',
  },
  {
    id: 'star',
    label: 'Gold Star',
    emoji: '⭐',
    image: '/stickers/star.svg',
    triggerNumbers: [5, 50],
    probability: 0.06,
    message: 'Top scout!',
    mode: 'auto',
  },
  {
    id: 'poop',
    label: 'Oh No',
    emoji: '💩',
    image: '/stickers/poop.svg',
    triggerNumbers: [2],
    probability: 0.05,
    message: 'Number twoooo… 💩',
    mode: 'manual',
  },
]

/** Find a sticker by id within a given list (defaults to the seed list). */
export function getStickerById(
  id: string | null | undefined,
  stickers: StickerConfig[] = DEFAULT_STICKERS,
): StickerConfig | null {
  if (!id) return null
  return stickers.find((s) => s.id === id) ?? null
}

/** Make a fresh id for a newly-added sticker. */
export function makeStickerId(label: string): string {
  const base = label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  return `${base || 'sticker'}-${Math.floor(performance.now()).toString(36)}`
}
