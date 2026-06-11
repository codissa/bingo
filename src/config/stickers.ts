// ---------------------------------------------------------------------------
// STICKER CONFIG  🎉
//
// Stickers ARE the photos in  public/stickers/  — nothing is hard-coded here.
// Drop a picture into that folder and it becomes a sticker automatically:
//   • it seeds the game on first run (DEFAULT_STICKERS, below), and
//   • it shows up live in the Admin screen even on an existing game — the
//     Sticker Manager reconciles the saved list against the folder on load
//     (see reconcileStickersWithFolder). Delete a photo and its sticker goes
//     away too.
//
// From the Admin screen you still tune everything per sticker, live:
//   • choose which NUMBERS trigger which sticker
//   • set each sticker to "Auto" (pops by itself) or "Manual" (button only)
//   • flip the master "Automated stickers" switch off entirely
//
// Every sticker image is preloaded into the browser cache up front (see
// usePreloadImages) so reveals are instant. KEEP UPLOADS SMALL: a multi-MB
// photo still costs bandwidth on first page load. Aim for a few hundred KB max
// and a display size around 256px.
// ---------------------------------------------------------------------------

import { STICKER_IMAGES, stickerImageName } from './stickerImages'

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
  /** Play the extra-special disco animation when shown — use for the bingo-win sticker. */
  disco?: boolean
}

/** Pretty label from a path: '/stickers/salimJack.png' -> 'Salim Jack'. */
function labelFromImage(path: string): string {
  const base = stickerImageName(path).replace(/\.[^.]+$/, '') // strip extension
  const words = base
    .replace(/[-_]+/g, ' ') // dashes / underscores -> spaces
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2') // camelCase -> spaced
    .trim()
  return words.replace(/\b\w/g, (c) => c.toUpperCase())
}

/** Stable id for a photo sticker, derived from its filename. */
function idFromImage(path: string): string {
  const base = stickerImageName(path).replace(/\.[^.]+$/, '')
  const slug = base.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  return `photo-${slug || 'sticker'}`
}

/** Turn one folder photo into a sensible default sticker (admin tunes the rest). */
function stickerForImage(path: string): StickerConfig {
  return {
    id: idFromImage(path),
    label: labelFromImage(path),
    emoji: '📸',
    image: path,
    triggerNumbers: [],
    probability: 0,
    message: '',
    mode: 'manual',
  }
}

/** Seed list = one sticker per photo currently in public/stickers/. */
export const DEFAULT_STICKERS: StickerConfig[] = STICKER_IMAGES.map(stickerForImage)

/**
 * Make a saved sticker list mirror the photos in public/stickers/:
 *   • DROP any sticker that points to a photo file that's gone (the old camp
 *     stickers land here once their SVGs are deleted),
 *   • ADD a default sticker for any new photo not yet represented.
 * Emoji-only stickers added by hand from the Admin screen (no image) are left
 * alone, as are the per-sticker settings (triggers, mode, message, disco) of
 * the photos that remain. Returns the SAME array reference when nothing
 * changed, so callers can cheaply skip a needless Firestore write.
 */
export function reconcileStickersWithFolder(
  stickers: StickerConfig[],
  images: string[] = STICKER_IMAGES,
): StickerConfig[] {
  if (images.length === 0) return stickers // safety: never wipe on an empty glob
  const available = new Set(images)
  // Keep emoji-only stickers (no image); drop ones whose photo file is missing.
  const kept = stickers.filter((s) => !s.image || available.has(s.image))
  const used = new Set(kept.map((s) => s.image))
  const added = images.filter((p) => !used.has(p)).map(stickerForImage)
  const changed = added.length > 0 || kept.length !== stickers.length
  return changed ? [...kept, ...added] : stickers
}

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
