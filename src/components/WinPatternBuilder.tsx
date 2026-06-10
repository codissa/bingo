import { useState } from 'react'
import { FirebaseGameStateService as svc } from '../services/FirebaseGameStateService'
import { cellOn } from '../config/winConditions'
import NeonButton from './ui/NeonButton'
import WinPatternCard from './WinPatternCard'

interface WinPatternBuilderProps {
  /** Current mask to seed the editor from when it opens. */
  seedMask: number
}

/**
 * Admin custom-pattern editor: tap cells on a 5×5 grid to build any mask, see a
 * live animated preview, then save it as the 'custom' win pattern.
 */
export default function WinPatternBuilder({ seedMask }: WinPatternBuilderProps) {
  const [open, setOpen] = useState(false)
  const [mask, setMask] = useState(seedMask)
  const [name, setName] = useState('')

  const toggleOpen = () => {
    if (!open) setMask(seedMask) // reseed from current state on open
    setOpen((o) => !o)
  }

  const toggleCell = (i: number) => setMask((m) => m ^ (1 << i))

  const save = () => {
    svc.saveCustomWinPattern(name, mask)
    setName('')
  }

  return (
    <div className="rounded-xl bg-white/5 p-3">
      <button
        type="button"
        onClick={toggleOpen}
        className="flex w-full items-center justify-between text-left text-sm font-medium text-white/80"
      >
        <span>🎨 Build custom pattern</span>
        <span className="text-white/40">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="mt-3 flex flex-col items-center gap-4">
          <div className="grid grid-cols-5 gap-1">
            {Array.from({ length: 25 }, (_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => toggleCell(i)}
                className={`h-8 w-8 rounded-md transition ${
                  cellOn(mask, i)
                    ? 'bg-neon-orange/60 ring-1 ring-neon-orange'
                    : 'bg-white/10 hover:bg-white/20'
                }`}
              />
            ))}
          </div>

          {mask !== 0 && (
            <div className="text-center">
              <div className="mb-1 text-xs text-white/40">Preview</div>
              <WinPatternCard mask={mask} patternId="custom" />
            </div>
          )}

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name this pattern…"
            className="w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-white outline-none focus:border-neon-purple"
          />

          <div className="grid w-full grid-cols-2 gap-2">
            <NeonButton variant="ghost" onClick={() => setMask(0)}>
              Clear
            </NeonButton>
            <NeonButton variant="primary" onClick={save} disabled={mask === 0 || !name.trim()}>
              💾 Save pattern
            </NeonButton>
          </div>
        </div>
      )}
    </div>
  )
}
