import { useGameState } from '../hooks/useGameState'
import CurrentNumberDisplay from '../components/CurrentNumberDisplay'
import RecentNumbers from '../components/RecentNumbers'
import NumberBoard from '../components/NumberBoard'
import PrizeCard from '../components/PrizeCard'
import WinConditionCard from '../components/WinConditionCard'
import WinPatternCard from '../components/WinPatternCard'
import SpecialMessageCard from '../components/SpecialMessageCard'
import RevealOverlay from '../components/RevealOverlay'
import ReactionsOverlay from '../components/ReactionsOverlay'
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
    <div className="flex h-screen flex-col gap-4 overflow-hidden p-4 lg:p-8">
      <header className="flex items-center justify-center gap-3">
        <img src="/logo.svg" alt="" className="h-12 w-12 animate-float lg:h-16 lg:w-16" />
        <h1 className="font-display text-3xl font-bold neon-text lg:text-4xl">Scouts Bingo</h1>
      </header>

      <StatusBanners state={state} size="huge" />

      <div className="flex min-h-0 flex-1 flex-col gap-4">
        {/* Over: the star of the show + recent, side by side to save vertical space */}
        <div className="flex shrink-0 flex-wrap items-center justify-center gap-x-12 gap-y-4">
          <CurrentNumberDisplay
            currentNumber={state.currentNumber}
            animationNonce={state.animationNonce}
            size="huge"
          />
          <RecentNumbers recentNumbers={state.recentNumbers} size="huge" />
        </div>

        {/* The wide board — takes the maximum remaining space, full width */}
        <div className="glass flex min-h-0 flex-1 flex-col p-4">
          <div className="mb-2 text-center font-display text-xl uppercase tracking-widest text-white/50">
            Called · {state.calledNumbers.length}
          </div>
          <div className="min-h-0 flex-1">
            <NumberBoard
              calledNumbers={state.calledNumbers}
              currentNumber={state.currentNumber}
              animationNonce={state.animationNonce}
              compact
            />
          </div>
        </div>

        {/* Under: any active cards, side by side */}
        {(state.showPrize ||
          state.showWinCondition ||
          (state.showWinPattern && state.winPatternMask !== 0) ||
          state.showSpecialMessage) && (
          <div className="flex shrink-0 flex-wrap items-stretch justify-center gap-4">
            {state.showPrize && <PrizeCard prizeText={state.prizeText} size="huge" />}
            {state.showWinCondition && (
              <WinConditionCard winConditionText={state.winConditionText} size="huge" />
            )}
            {state.showWinPattern && state.winPatternMask !== 0 && (
              <WinPatternCard
                mask={state.winPatternMask}
                patternId={state.winPatternId}
                size="huge"
              />
            )}
            {state.showSpecialMessage && (
              <SpecialMessageCard specialMessage={state.specialMessage} size="huge" />
            )}
          </div>
        )}
      </div>

      <Confetti trigger={state.animationNonce} intensity="big" />
      <ReactionsOverlay enabled={state.reactionsEnabled} />
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
