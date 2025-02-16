'use client'

import { Bungee } from 'next/font/google'
import { Loader2 } from 'lucide-react'
import { useGameState } from '@/app/hooks/useGameState'
import GameBoard from '@/app/components/GameBoard'
import PlayerSelector from '@/app/components/PlayerSelector'
import { getPlayerDisplayName } from '@/app/utils/gameLogic'

const bungee = Bungee({
  subsets: ['latin'],
  weight: ['400']
})

export default function ConnectFour () {
  const {
    board,
    currentPlayer,
    winner,
    redPlayer,
    setRedPlayer,
    yellowPlayer,
    setYellowPlayer,
    isAIThinking,
    lastMove,
    winningPositions,
    handleColumnClick,
    resetGame
  } = useGameState()

  return (
    <div
      className={`flex flex-col items-center justify-center min-h-screen bg-gray-100 p-8 ${bungee.className}`}
    >
      <h1 className='text-5xl font-bold mb-8 text-gray-800 tracking-wide'>
        Connect <span className='text-blue-600'>Four</span>
      </h1>

      {winner ? (
        <div className='mb-6 text-2xl font-bold animate-bounce'>
          <span
            className={`${
              winner === 'red' ? 'text-red-600' : 'text-yellow-500'
            }`}
          >
            {getPlayerDisplayName(winner, winner === 'red' ? redPlayer : yellowPlayer)} wins!
          </span>
        </div>
      ) : (
        <div className='mb-6 text-2xl font-semibold text-gray-700 flex items-center gap-3'>
          Current Player:{' '}
          <span
            className={`${
              currentPlayer === 'red' ? 'text-red-600' : 'text-yellow-500'
            } inline-block transition-transform duration-300 hover:scale-110`}
          >
            {getPlayerDisplayName(currentPlayer, currentPlayer === 'red' ? redPlayer : yellowPlayer)}
          </span>
          {isAIThinking && (
            <Loader2 className='w-6 h-6 animate-spin text-black stroke-[2px]' />
          )}
        </div>
      )}

      <GameBoard
        board={board}
        handleColumnClick={handleColumnClick}
        lastMove={lastMove}
        winningPositions={winningPositions}
      />

      <div className='flex gap-4 mt-8 mb-6'>
        <PlayerSelector
          color='red'
          player={redPlayer}
          onPlayerChange={setRedPlayer}
        />
        <PlayerSelector
          color='yellow'
          player={yellowPlayer}
          onPlayerChange={setYellowPlayer}
        />
      </div>

      <button
        onClick={resetGame}
        className='mt-4 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg
                 font-semibold text-lg shadow-md hover:from-blue-600 hover:to-blue-700
                 transform hover:scale-105 transition-all duration-200
                 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50'
      >
        New Game
      </button>
    </div>
  )
}
