import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}
interface State {
  error: Error | null
}

/**
 * Catches render errors so a crash shows a readable message instead of a blank
 * white screen — handy if a screen ever hits unexpected data on the night.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[bingo] render error:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen items-center justify-center p-6 text-center">
          <div className="glass max-w-lg">
            <h1 className="mb-2 font-display text-2xl font-bold text-rose-400">Something broke 😬</h1>
            <p className="mb-3 text-white/60">
              The screen hit an error. Try refreshing. If it keeps happening, the details below help
              debugging.
            </p>
            <pre className="max-h-48 overflow-auto rounded-lg bg-black/40 p-3 text-left text-xs text-rose-300">
              {this.state.error.message}
            </pre>
            <button
              onClick={() => location.reload()}
              className="mt-4 rounded-xl bg-gradient-to-r from-neon-pink to-neon-purple px-5 py-2.5 font-semibold text-white"
            >
              Reload
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
