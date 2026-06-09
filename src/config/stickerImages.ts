// ---------------------------------------------------------------------------
// AVAILABLE STICKER IMAGES  🖼️
//
// The Sticker Manager dropdown is driven by whatever lives in public/stickers/.
// Vite's import.meta.glob enumerates those files at build time, so dropping a
// new image into that folder makes it show up in the dropdown automatically —
// no code edit needed.
//
// We only read the KEYS (filenames) here; the lazy importers are never called,
// so nothing extra gets bundled. Public assets keep their served path
// (/stickers/<name>), which is the convention StickerConfig.image expects.
// ---------------------------------------------------------------------------

const files = import.meta.glob('/public/stickers/*.{svg,png,jpg,jpeg,gif,webp}')

/** Served paths of every sticker image, e.g. '/stickers/owl.svg'. */
export const STICKER_IMAGES: string[] = Object.keys(files)
  .map((p) => p.replace('/public', '')) // '/public/stickers/owl.svg' -> '/stickers/owl.svg'
  .sort()

/** Just the filename for a served path, e.g. '/stickers/owl.svg' -> 'owl.svg'. */
export function stickerImageName(path: string): string {
  return path.split('/').pop() ?? path
}
