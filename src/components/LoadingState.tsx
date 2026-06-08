import { isFirebaseConfigured } from '../services/firebase'

/** Shown while the first snapshot loads, or if Firebase isn't configured. */
export default function LoadingState({ loading }: { loading: boolean }) {
  if (!isFirebaseConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-center">
        <div className="glass max-w-md">
          <h1 className="mb-2 font-display text-2xl font-bold neon-text">Not configured yet</h1>
          <p className="text-white/60">
            Firebase env vars are missing. Copy <code className="text-neon-blue">.env.example</code> to{' '}
            <code className="text-neon-blue">.env</code>, fill in your Firebase config, and restart the dev server.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="animate-pulse-glow font-display text-2xl neon-text">
        {loading ? 'Loading the game…' : 'Waiting for the first number…'}
      </div>
    </div>
  )
}
