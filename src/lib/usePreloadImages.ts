import { useEffect } from 'react'
import type { StickerConfig } from '../config/stickers'

/**
 * URLs we've already kicked off a preload for. Module-level so it survives
 * component remounts and is shared across every screen — we never fetch the
 * same sticker image twice.
 */
const preloaded = new Set<string>()

/**
 * Warm the browser cache for every sticker image in the LIVE config.
 *
 * Stickers are editable from the Admin screen, so this is driven by the
 * `stickers` array (not a fixed list): the moment a newly-added sticker's
 * config arrives over the Firestore subscription, its image is fetched and
 * decoded here — long before that number is ever called. The reveal then
 * paints instantly instead of fetching on-demand.
 */
export function usePreloadImages(stickers: StickerConfig[]): void {
  // Join the URLs so the effect only re-runs when the set of images changes,
  // not on every unrelated game-state update.
  const urls = stickers
    .map((s) => s.image)
    .filter((u): u is string => !!u)
  const key = urls.join('|')

  useEffect(() => {
    for (const url of urls) {
      if (preloaded.has(url)) continue
      preloaded.add(url)
      const img = new Image()
      img.src = url
      // Decode ahead of time so the bitmap is ready, not just downloaded.
      // Best-effort — older browsers / failed loads just reject, harmlessly.
      img.decode?.().catch(() => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
}
