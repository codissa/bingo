import { useEffect, useState } from 'react'
import { FirebaseGameStateService as svc } from '../services/FirebaseGameStateService'
import type { GameState } from '../types/gameState'
import GlassCard from './ui/GlassCard'
import NeonButton from './ui/NeonButton'
import StickerManager from './StickerManager'

interface AdminControlsProps {
  state: GameState
}

// --- small building blocks -------------------------------------------------

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <GlassCard>
      <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-widest text-white/60">
        {title}
      </h3>
      {children}
    </GlassCard>
  )
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 rounded-xl bg-white/5 px-4 py-2.5 text-left hover:bg-white/10"
    >
      <span className="font-medium">{label}</span>
      <span
        className={`relative h-6 w-11 rounded-full transition ${
          checked ? 'bg-neon-green' : 'bg-white/20'
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
            checked ? 'left-[1.4rem]' : 'left-0.5'
          }`}
        />
      </span>
    </button>
  )
}

/**
 * A text field whose value lives locally while typing and is pushed to
 * Firestore on blur (so we don't write on every keystroke). Re-syncs if the
 * remote value changes from elsewhere.
 */
function SyncedField({
  label,
  remoteValue,
  onCommit,
  multiline = false,
}: {
  label: string
  remoteValue: string
  onCommit: (v: string) => void
  multiline?: boolean
}) {
  const [value, setValue] = useState(remoteValue)
  useEffect(() => setValue(remoteValue), [remoteValue])

  const cls =
    'w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-white outline-none focus:border-neon-purple'

  return (
    <label className="block">
      <span className="mb-1 block text-xs text-white/50">{label}</span>
      {multiline ? (
        <textarea
          rows={2}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => onCommit(value)}
          className={cls}
        />
      ) : (
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => onCommit(value)}
          className={cls}
        />
      )}
    </label>
  )
}

// --- main component --------------------------------------------------------

export default function AdminControls({ state }: AdminControlsProps) {
  const canUndo = state.calledNumbers.length > 0
  const canRedo = state.undoneNumbers.length > 0

  return (
    <div className="grid gap-4">
      {/* Number actions */}
      <Section title="Number Actions">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <NeonButton variant="ghost" disabled={!canUndo} onClick={() => svc.undo()}>
            ↶ Undo
          </NeonButton>
          <NeonButton variant="ghost" disabled={!canRedo} onClick={() => svc.redo()}>
            ↷ Redo
          </NeonButton>
          <NeonButton variant="primary" onClick={() => svc.randomNumber()}>
            🎲 Random
          </NeonButton>
          <NeonButton
            variant="ghost"
            onClick={() => svc.setActiveSticker(null)}
            title="Hide any sticker currently shown"
          >
            🧹 Clear Sticker
          </NeonButton>
        </div>
      </Section>

      {/* Game mode */}
      <Section title="Game Mode">
        <div className="grid gap-2">
          <Toggle
            label="⏸ Pause game"
            checked={state.isPaused}
            onChange={(v) => svc.setPaused(v)}
          />
          <Toggle
            label="🔍 Winner check mode"
            checked={state.isWinnerCheckMode}
            onChange={(v) => svc.setWinnerCheckMode(v)}
          />
        </div>
      </Section>

      {/* Prize */}
      <Section title="Prize">
        <div className="grid gap-3">
          <SyncedField
            label="Prize text"
            remoteValue={state.prizeText}
            onCommit={(v) => svc.setPrizeText(v)}
          />
          <Toggle label="Show prize" checked={state.showPrize} onChange={(v) => svc.setShowPrize(v)} />
        </div>
      </Section>

      {/* Win condition */}
      <Section title="Win Condition">
        <div className="grid gap-3">
          <SyncedField
            label="What you need to win"
            remoteValue={state.winConditionText}
            onCommit={(v) => svc.setWinConditionText(v)}
          />
          <Toggle
            label="Show win condition"
            checked={state.showWinCondition}
            onChange={(v) => svc.setShowWinCondition(v)}
          />
        </div>
      </Section>

      {/* Special message */}
      <Section title="Special Message">
        <div className="grid gap-3">
          <SyncedField
            label="Announcement / shout-out"
            remoteValue={state.specialMessage}
            onCommit={(v) => svc.setSpecialMessage(v)}
            multiline
          />
          <Toggle
            label="Show special message"
            checked={state.showSpecialMessage}
            onChange={(v) => svc.setShowSpecialMessage(v)}
          />
        </div>
      </Section>

      {/* Sticker & number manager */}
      <StickerManager
        stickers={state.stickers}
        autoStickersEnabled={state.autoStickersEnabled}
        activeSticker={state.activeSticker}
      />

      {/* Danger zone */}
      <Section title="Danger Zone">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <NeonButton
            variant="danger"
            onClick={() => {
              if (confirm('Reset the BOARD? This clears called numbers but keeps the prize & win condition.'))
                svc.resetBoard()
            }}
          >
            ♻️ Reset Board
          </NeonButton>
          <NeonButton
            variant="danger"
            onClick={() => {
              if (confirm('RESET EVERYTHING? Clears the board AND all text, and starts a new round. Are you sure?'))
                svc.resetEverything()
            }}
          >
            💥 Reset Everything
          </NeonButton>
        </div>
      </Section>
    </div>
  )
}
