import { useGameState } from '../hooks/useGameState'
import CurrentNumberDisplay from '../components/CurrentNumberDisplay'
import RecentNumbers from '../components/RecentNumbers'
import NumberBoard from '../components/NumberBoard'
import PrizeCard from '../components/PrizeCard'
import WinConditionCard from '../components/WinConditionCard'
import SpecialMessageCard from '../components/SpecialMessageCard'
import RevealOverlay from '../components/RevealOverlay'
import Confetti from '../components/Confetti'
import StatusBanners from '../components/StatusBanners'
import LoadingState from '../components/LoadingState'

/**
 * DISPLAY — the TV / projector screen. Same live state, but giant typography,
 * minimal chrome and strong animations. Designed to be read across the room.
 */
export default function DisplayPage() {
  const { state, loading } = useGameState()

  if (!state) return <LoadingState loading={loading} />

  return (
    <div className="flex min-h-screen flex-col gap-4 p-4 lg:p-8">
      <header className="flex items-center justify-center gap-3">
        <img src="/logo.svg" alt="" className="h-12 w-12 animate-float lg:h-16 lg:w-16" />
        <h1 className="font-display text-3xl font-bold neon-text lg:text-4xl">Scouts Bingo</h1>
      </header>

      <StatusBanners state={state} size="huge" />

      <div className="grid flex-1 grid-cols-1 items-center gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Left: the star of the show */}
        <div className="flex flex-col items-center justify-center gap-6">
          <CurrentNumberDisplay
            currentNumber={state.currentNumber}
            animationNonce={state.animationNonce}
            size="huge"
          />
          <RecentNumbers recentNumbers={state.recentNumbers} size="huge" />
        </div>

        {/* Right: board + any active cards */}
        <div className="flex flex-col gap-4">
          <div className="glass p-4">
            <div className="mb-2 text-center font-display text-xl uppercase tracking-widest text-white/50">
              Called · {state.calledNumbers.length}
            </div>
            <NumberBoard
              calledNumbers={state.calledNumbers}
              currentNumber={state.currentNumber}
              animationNonce={state.animationNonce}
              compact
            />
          </div>
          {state.showPrize && <PrizeCard prizeText={state.prizeText} size="huge" />}
          {state.showWinCondition && (
            <WinConditionCard winConditionText={state.winConditionText} size="huge" />
          )}
          {state.showSpecialMessage && (
            <SpecialMessageCard specialMessage={state.specialMessage} size="huge" />
          )}
        </div>
      </div>

      <Confetti trigger={state.animationNonce} intensity="big" />
      <RevealOverlay
        currentNumber={state.currentNumber}
        activeSticker={state.activeSticker}
        stickers={state.stickers}
        animationNonce={state.animationNonce}
        size="huge"
      />
    </div>
  )
}
