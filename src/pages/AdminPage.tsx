import { Link } from 'react-router-dom'
import AdminGate from '../components/AdminGate'
import { useGameState } from '../hooks/useGameState'
import { FirebaseGameStateService as svc } from '../services/FirebaseGameStateService'
import NumberBoard from '../components/NumberBoard'
import AdminControls from '../components/AdminControls'
import LoadingState from '../components/LoadingState'
import { letterFor } from '../lib/bingo'

function AdminScreen() {
  // ensureDoc: create the game document on first load if it's missing.
  const { state, loading } = useGameState({ ensureDoc: true })

  if (!state) return <LoadingState loading={loading} />

  const handleCall = (n: number) => svc.callNumber(n)
  const handleRemove = (n: number) => {
    if (confirm(`Remove number ${n}? It will no longer count as called.`)) {
      svc.removeNumber(n)
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-5">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold neon-text">Bingo Control</h1>
          <p className="text-xs text-white/40">
            Round {state.roundNumber} · {state.calledNumbers.length} called
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          {state.currentNumber != null && (
            <span className="glass px-4 py-2 font-display text-lg font-bold">
              {letterFor(state.currentNumber)}-{state.currentNumber}
            </span>
          )}
          <Link to="/viewer" target="_blank" className="text-neon-blue hover:underline">
            Viewer ↗
          </Link>
          <Link to="/display" target="_blank" className="text-neon-blue hover:underline">
            Display ↗
          </Link>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        {/* Interactive board */}
        <div className="glass p-3 sm:p-4">
          <p className="mb-3 text-center text-xs text-white/40">
            Tap a number to call it · tap a called number to remove it
          </p>
          <NumberBoard
            calledNumbers={state.calledNumbers}
            currentNumber={state.currentNumber}
            animationNonce={state.animationNonce}
            interactive
            onCall={handleCall}
            onRemove={handleRemove}
          />
        </div>

        {/* Controls */}
        <AdminControls state={state} />
      </div>
    </div>
  )
}

/** ADMIN — password-gated control room for the number caller. */
export default function AdminPage() {
  return (
    <AdminGate>
      <AdminScreen />
    </AdminGate>
  )
}
