import { useState, type ReactNode } from 'react'
import GlassCard from './ui/GlassCard'
import NeonButton from './ui/NeonButton'

const STORAGE_KEY = 'bingo-admin-ok'
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD ?? ''

interface AdminGateProps {
  children: ReactNode
}

/**
 * Dead-simple password gate for /admin. NOT real security — it just keeps
 * curious players out. The password lives in VITE_ADMIN_PASSWORD. Once entered
 * correctly it's remembered in sessionStorage so a refresh won't re-prompt.
 */
export default function AdminGate({ children }: AdminGateProps) {
  const [unlocked, setUnlocked] = useState(
    () => sessionStorage.getItem(STORAGE_KEY) === '1',
  )
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)

  if (unlocked) return <>{children}</>

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (ADMIN_PASSWORD && value === ADMIN_PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY, '1')
      setUnlocked(true)
    } else {
      setError(true)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <GlassCard className="w-full max-w-sm">
        <h1 className="mb-1 text-center font-display text-2xl font-bold neon-text">
          Admin Access
        </h1>
        <p className="mb-4 text-center text-sm text-white/50">Scouts Bingo Night control room</p>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <input
            type="password"
            autoFocus
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              setError(false)
            }}
            placeholder="Password"
            className="rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-white outline-none focus:border-neon-purple"
          />
          {error && (
            <p className="text-sm text-rose-400">
              {ADMIN_PASSWORD ? 'Wrong password — try again.' : 'No admin password is set (VITE_ADMIN_PASSWORD).'}
            </p>
          )}
          <NeonButton type="submit">Enter</NeonButton>
        </form>
      </GlassCard>
    </div>
  )
}
