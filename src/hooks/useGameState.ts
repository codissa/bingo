import { useEffect, useState } from 'react'
import { FirebaseGameStateService } from '../services/FirebaseGameStateService'
import type { GameState } from '../types/gameState'

// ---------------------------------------------------------------------------
// Live subscription to the shared game document.
//   state    — the latest GameState, or null while loading / on error.
//   loading  — true until the first snapshot arrives.
// `ensureDoc` is true on the admin screen so it creates the doc if missing.
// ---------------------------------------------------------------------------

export function useGameState(options: { ensureDoc?: boolean } = {}) {
  const { ensureDoc = false } = options
  const [state, setState] = useState<GameState | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (ensureDoc) {
      FirebaseGameStateService.ensureDoc().catch((err) =>
        console.error('[bingo] ensureDoc failed:', err),
      )
    }
    const unsub = FirebaseGameStateService.subscribe((next) => {
      setState(next)
      setLoading(false)
    })
    return unsub
  }, [ensureDoc])

  return { state, loading }
}
