import { useEffect, useState } from 'react'
import { FirebaseGameStateService as svc } from '../services/FirebaseGameStateService'
import { makeStickerId, type StickerConfig, type StickerMode } from '../config/stickers'
import { STICKER_IMAGES, stickerImageName } from '../config/stickerImages'
import { MAX_NUMBER, MIN_NUMBER } from '../config/gameConfig'
import GlassCard from './ui/GlassCard'
import NeonButton from './ui/NeonButton'

// Editable rows keep number-ish fields as strings so typing feels natural;
// we parse them when saving.
interface EditableSticker {
  id: string
  label: string
  emoji: string
  image: string
  triggerNumbers: string
  probability: string
  message: string
  mode: StickerMode
  disco: boolean
}

function toEditable(s: StickerConfig): EditableSticker {
  return {
    id: s.id,
    label: s.label ?? '',
    emoji: s.emoji ?? '',
    image: s.image ?? '',
    triggerNumbers: (s.triggerNumbers ?? []).join(', '),
    probability: s.probability != null ? String(s.probability) : '',
    message: s.message ?? '',
    mode: s.mode ?? 'manual',
    disco: s.disco ?? false,
  }
}

function parseTriggers(str: string): number[] {
  const nums = str
    .split(/[^0-9]+/)
    .map((x) => Number(x))
    .filter((n) => Number.isFinite(n) && n >= MIN_NUMBER && n <= MAX_NUMBER)
  return Array.from(new Set(nums)).sort((a, b) => a - b)
}

function parseProbability(str: string): number {
  const v = Number(str)
  if (!Number.isFinite(v) || v < 0) return 0
  return Math.min(1, v)
}

function toConfig(e: EditableSticker): StickerConfig {
  return {
    id: e.id,
    label: e.label.trim() || 'Sticker',
    emoji: e.emoji.trim() || '🎉',
    image: e.image.trim(), // '' = use emoji
    triggerNumbers: parseTriggers(e.triggerNumbers),
    probability: parseProbability(e.probability),
    message: e.message.trim(),
    mode: e.mode,
    disco: e.disco,
  }
}

const inputCls =
  'w-full rounded-lg border border-white/15 bg-black/30 px-2 py-1.5 text-sm text-white outline-none focus:border-neon-purple'

interface StickerManagerProps {
  stickers: StickerConfig[]
  autoStickersEnabled: boolean
  activeSticker: string | null
}

export default function StickerManager({
  stickers,
  autoStickersEnabled,
  activeSticker,
}: StickerManagerProps) {
  const [draft, setDraft] = useState<EditableSticker[]>(() => stickers.map(toEditable))
  const [dirty, setDirty] = useState(false)

  // Re-sync from Firestore only when we have no unsaved local edits.
  useEffect(() => {
    if (!dirty) setDraft(stickers.map(toEditable))
  }, [stickers, dirty])

  const update = (id: string, field: keyof EditableSticker, value: string) => {
    setDirty(true)
    setDraft((d) => d.map((s) => (s.id === id ? { ...s, [field]: value } : s)))
  }

  const setMode = (id: string, mode: StickerMode) => {
    setDirty(true)
    setDraft((d) => d.map((s) => (s.id === id ? { ...s, mode } : s)))
  }

  const setDisco = (id: string, disco: boolean) => {
    setDirty(true)
    setDraft((d) => d.map((s) => (s.id === id ? { ...s, disco } : s)))
  }

  const addSticker = () => {
    setDirty(true)
    setDraft((d) => [
      ...d,
      {
        id: makeStickerId('new'),
        label: 'New sticker',
        emoji: '✨',
        image: '',
        triggerNumbers: '',
        probability: '',
        message: '',
        mode: 'manual',
        disco: false,
      },
    ])
  }

  const removeSticker = (id: string) => {
    setDirty(true)
    setDraft((d) => d.filter((s) => s.id !== id))
  }

  const save = async () => {
    await svc.saveStickers(draft.map(toConfig))
    setDirty(false)
  }

  const revert = () => {
    setDraft(stickers.map(toEditable))
    setDirty(false)
  }

  return (
    <GlassCard>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-sm font-bold uppercase tracking-widest text-white/60">
          Stickers &amp; Numbers
        </h3>
        <button
          type="button"
          onClick={() => svc.setAutoStickers(!autoStickersEnabled)}
          className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
            autoStickersEnabled
              ? 'bg-neon-green/20 text-neon-green ring-1 ring-neon-green/50'
              : 'bg-white/5 text-white/50 ring-1 ring-white/15'
          }`}
          title="Master switch for stickers that pop by themselves"
        >
          {autoStickersEnabled ? '🤖 Automated: ON' : '🤖 Automated: OFF'}
        </button>
      </div>

      <p className="mb-3 text-xs text-white/40">
        Set which numbers pop which sticker. <b>Auto</b> stickers pop by themselves (on their
        trigger numbers or at random); <b>Manual</b> stickers only pop from the “Show” button.
        Turn off “Automated” to stop all self-popping stickers.
      </p>

      <div className="grid gap-3">
        {draft.map((s) => (
          <div key={s.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="mb-2 flex items-center gap-2">
              <input
                value={s.emoji}
                onChange={(e) => update(s.id, 'emoji', e.target.value)}
                className={`${inputCls} w-14 text-center text-lg`}
                aria-label="emoji"
              />
              <input
                value={s.label}
                onChange={(e) => update(s.id, 'label', e.target.value)}
                placeholder="Label"
                className={`${inputCls} flex-1`}
                aria-label="label"
              />
              <button
                type="button"
                onClick={() => svc.setActiveSticker(s.id)}
                className="rounded-lg bg-neon-pink/20 px-2.5 py-1.5 text-sm text-neon-pink ring-1 ring-neon-pink/40 hover:bg-neon-pink/30"
                title="Show this sticker now"
              >
                Show
              </button>
              <button
                type="button"
                onClick={() => removeSticker(s.id)}
                className="rounded-lg bg-white/5 px-2.5 py-1.5 text-sm text-rose-400 hover:bg-rose-500/20"
                title="Delete sticker"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <label className="block">
                <span className="mb-0.5 block text-[11px] text-white/40">Trigger numbers</span>
                <input
                  value={s.triggerNumbers}
                  onChange={(e) => update(s.id, 'triggerNumbers', e.target.value)}
                  placeholder="e.g. 7, 22, 70"
                  className={inputCls}
                />
              </label>
              <label className="block">
                <span className="mb-0.5 block text-[11px] text-white/40">Random chance (0–1)</span>
                <input
                  value={s.probability}
                  onChange={(e) => update(s.id, 'probability', e.target.value)}
                  placeholder="e.g. 0.05"
                  inputMode="decimal"
                  className={inputCls}
                />
              </label>
              <label className="col-span-2 block">
                <span className="mb-0.5 block text-[11px] text-white/40">Message (optional)</span>
                <input
                  value={s.message}
                  onChange={(e) => update(s.id, 'message', e.target.value)}
                  placeholder="Funny caption…"
                  className={inputCls}
                />
              </label>
              <label className="col-span-2 block">
                <span className="mb-0.5 block text-[11px] text-white/40">
                  Image (optional — overrides emoji)
                </span>
                <div className="flex items-center gap-2">
                  <select
                    value={s.image}
                    onChange={(e) => update(s.id, 'image', e.target.value)}
                    className={`${inputCls} flex-1`}
                  >
                    <option value="">— Emoji only —</option>
                    {/* Keep a stale/renamed value visible instead of blanking it. */}
                    {s.image && !STICKER_IMAGES.includes(s.image) && (
                      <option value={s.image}>{stickerImageName(s.image)} (missing?)</option>
                    )}
                    {STICKER_IMAGES.map((path) => (
                      <option key={path} value={path}>
                        {stickerImageName(path)}
                      </option>
                    ))}
                  </select>
                  {s.image && (
                    <img
                      src={s.image}
                      alt=""
                      className="h-12 w-12 shrink-0 rounded-lg border border-white/15 bg-black/30 object-contain p-1"
                      onError={(e) => {
                        e.currentTarget.style.visibility = 'hidden'
                      }}
                    />
                  )}
                </div>
              </label>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              {/* Auto / Manual segmented toggle */}
              <div className="inline-flex overflow-hidden rounded-lg ring-1 ring-white/15">
                {(['auto', 'manual'] as StickerMode[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMode(s.id, m)}
                    className={`px-3 py-1 text-sm capitalize ${
                      s.mode === m ? 'bg-neon-purple text-white' : 'bg-white/5 text-white/50'
                    }`}
                  >
                    {m === 'auto' ? 'Auto (regular)' : 'Manual'}
                  </button>
                ))}
              </div>

              {/* Disco (bingo-win) toggle */}
              <button
                type="button"
                onClick={() => setDisco(s.id, !s.disco)}
                className={`rounded-lg px-3 py-1 text-sm font-semibold ring-1 transition ${
                  s.disco
                    ? 'bg-neon-pink/20 text-neon-pink ring-neon-pink/50'
                    : 'bg-white/5 text-white/50 ring-white/15'
                }`}
                title="Play the disco animation when shown — for the bingo-win sticker"
              >
                🪩 Disco
              </button>
            </div>

            {activeSticker === s.id && (
              <span className="ml-2 text-xs text-neon-pink">● currently active</span>
            )}
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <NeonButton variant="ghost" onClick={addSticker}>
          ＋ Add sticker
        </NeonButton>
        <div className="flex-1" />
        {dirty && <span className="text-xs text-neon-yellow">Unsaved changes</span>}
        {dirty && (
          <NeonButton variant="ghost" onClick={revert}>
            Revert
          </NeonButton>
        )}
        <NeonButton variant="success" onClick={save} disabled={!dirty}>
          💾 Save
        </NeonButton>
      </div>
    </GlassCard>
  )
}
