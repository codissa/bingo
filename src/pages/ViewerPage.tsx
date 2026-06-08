import { useGameState } from '../hooks/useGameState'
import CurrentNumberDisplay from '../components/CurrentNumberDisplay'
import RecentNumbers from '../components/RecentNumbers'
import NumberBoard from '../components/NumberBoard'
import PrizeCard from '../components/PrizeCard'
import WinConditionCard from '../components/WinConditionCard'
import SpecialMessageCard from '../components/SpecialMessageCard'
import StickerPopup from '../components/StickerPopup'
import Confetti from '../components/Confetti'
import StatusBanners from '../components/StatusBanners'
import LoadingState from '../components/LoadingState'
import GlassCard from '../components/ui/GlassCard'

/**
 * VIEWER — what players watch on their phones. Mobile-first, single column,
 * big and readable. Live-subscribed to the shared game state.
 */
export default function ViewerPage() {
  const { state, loading } = useGameState()

  if (!state) return <LoadingState loading={loading} />

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-4 px-4 py-5">
      <header className="flex flex-col items-center text-center">
        <img src="/logo.svg" alt="" className="h-16 w-16 animate-float drop-shadow-[0_0_18px_rgba(168,85,247,0.5)]" />
        <h1 className="mt-1 font-display text-2xl font-bold neon-text sm:text-3xl">🎉 Scouts Bingo</h1>
        <p className="text-xs text-white/40">Round {state.roundNumber}</p>
      </header>

      <StatusBanners state={state} />

      <GlassCard className="!p-3">
        <CurrentNumberDisplay
          currentNumber={state.currentNumber}
          animationNonce={state.animationNonce}
        />
      </GlassCard>

      <RecentNumbers recentNumbers={state.recentNumbers} />

      {state.showPrize && <PrizeCard prizeText={state.prizeText} />}
      {state.showWinCondition && <WinConditionCard winConditionText={state.winConditionText} />}
      {state.showSpecialMessage && <SpecialMessageCard specialMessage={state.specialMessage} />}

      <GlassCard>
        <h2 className="mb-3 text-center font-display text-sm uppercase tracking-widest text-white/50">
          Called Numbers · {state.calledNumbers.length}
        </h2>
        <NumberBoard
          calledNumbers={state.calledNumbers}
          currentNumber={state.currentNumber}
          animationNonce={state.animationNonce}
        />
      </GlassCard>

      <Confetti trigger={state.animationNonce} />
      <StickerPopup
        activeSticker={state.activeSticker}
        stickers={state.stickers}
        animationNonce={state.animationNonce}
      />
    </div>
  )
}
