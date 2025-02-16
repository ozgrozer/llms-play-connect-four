'use client'

import { Bungee } from 'next/font/google'
import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

// Add type definition for fetch
/** @type {typeof globalThis.fetch} */
const fetch = globalThis.fetch

const bungee = Bungee({
  subsets: ['latin'],
  weight: ['400']
})

const AI_PLAYERS = {
  CLAUDE: 'Claude 3.5 Sonnet',
  GPT4: 'OpenAI GPT-4o',
  HUMAN: 'Human'
}

export default function ConnectFour () {
  const [board, setBoard] = useState(
    Array(6)
      .fill()
      .map(() => Array(7).fill(null))
  )
  const [currentPlayer, setCurrentPlayer] = useState('red')
  const [winner, setWinner] = useState(null)
  const [redPlayer, setRedPlayer] = useState(AI_PLAYERS.HUMAN)
  const [yellowPlayer, setYellowPlayer] = useState(AI_PLAYERS.HUMAN)
  const [isAIThinking, setIsAIThinking] = useState(false)
  const [lastMove, setLastMove] = useState(null)

  const checkWin = (board, row, col, player) => {
    // Check horizontal
    for (let c = 0; c <= 3; c++) {
      if (
        board[row][c] === player &&
        board[row][c + 1] === player &&
        board[row][c + 2] === player &&
        board[row][c + 3] === player
      ) {
        return true
      }
    }

    // Check vertical
    for (let r = 0; r <= 2; r++) {
      if (
        board[r][col] === player &&
        board[r + 1][col] === player &&
        board[r + 2][col] === player &&
        board[r + 3][col] === player
      ) {
        return true
      }
    }

    // Check diagonal (positive slope)
    for (let r = 3; r < 6; r++) {
      for (let c = 0; c <= 3; c++) {
        if (
          board[r][c] === player &&
          board[r - 1][c + 1] === player &&
          board[r - 2][c + 2] === player &&
          board[r - 3][c + 3] === player
        ) {
          return true
        }
      }
    }

    // Check diagonal (negative slope)
    for (let r = 0; r <= 2; r++) {
      for (let c = 0; c <= 3; c++) {
        if (
          board[r][c] === player &&
          board[r + 1][c + 1] === player &&
          board[r + 2][c + 2] === player &&
          board[r + 3][c + 3] === player
        ) {
          return true
        }
      }
    }

    return false
  }

  const resetGame = () => {
    setBoard(
      Array(6)
        .fill()
        .map(() => Array(7).fill(null))
    )
    setCurrentPlayer('red')
    setWinner(null)
    setIsAIThinking(false)
    setLastMove(null)

    // Trigger AI move if red player is AI
    if (redPlayer !== AI_PLAYERS.HUMAN) {
      setTimeout(() => makeAIMove(), 500)
    }
  }

  const getCurrentAIPlayer = () => {
    if (currentPlayer === 'red' && redPlayer !== AI_PLAYERS.HUMAN) {
      return redPlayer
    }
    if (currentPlayer === 'yellow' && yellowPlayer !== AI_PLAYERS.HUMAN) {
      return yellowPlayer
    }
    return null
  }

  const makeAIMove = async () => {
    const aiPlayer = getCurrentAIPlayer()
    if (!aiPlayer || winner) {
      setIsAIThinking(false)
      return
    }

    setIsAIThinking(true)
    try {
      const response = await fetch('/api/make-move', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          board,
          currentPlayer,
          model: aiPlayer
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get AI move')
      }

      handleColumnClick(data.column, true)
      setIsAIThinking(false)
    } catch (error) {
      console.error('Error getting AI move:', error)
      setIsAIThinking(false)
      // Optionally show error to user here
    }
  }

  useEffect(() => {
    const aiPlayer = getCurrentAIPlayer()
    if (aiPlayer && !winner && !isAIThinking) {
      setTimeout(() => makeAIMove(), 500)
    }
  }, [currentPlayer, winner, board, isAIThinking])

  const handleColumnClick = (colIndex, isAIMove = false) => {
    if (winner || isAIThinking) return

    const currentAIPlayer = getCurrentAIPlayer()
    if (currentAIPlayer && !isAIMove) return // Only prevent human moves during AI turns

    // Check if column is full
    if (board[0][colIndex] !== null) {
      console.error('Column is full, cannot make move')
      setIsAIThinking(false)
      return
    }

    const newBoard = [...board]
    for (let row = 5; row >= 0; row--) {
      if (!newBoard[row][colIndex]) {
        newBoard[row][colIndex] = currentPlayer
        setBoard(newBoard)
        setLastMove({ row, col: colIndex })

        if (checkWin(newBoard, row, colIndex, currentPlayer)) {
          setWinner(currentPlayer)
          setIsAIThinking(false) // Ensure AI thinking is reset on win
          return
        }

        // Only switch players if no winner
        setCurrentPlayer(currentPlayer === 'red' ? 'yellow' : 'red')
        break
      }
    }
  }

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
            {winner === 'red'
              ? (redPlayer === AI_PLAYERS.HUMAN
                ? 'Human'
                : redPlayer.startsWith('Claude')
                  ? 'Claude'
                  : 'OpenAI')
              : (yellowPlayer === AI_PLAYERS.HUMAN
                ? 'Human'
                : yellowPlayer.startsWith('Claude')
                  ? 'Claude'
                  : 'OpenAI')} wins!
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
            {currentPlayer === 'red'
              ? redPlayer === AI_PLAYERS.HUMAN
                ? 'Human'
                : redPlayer.startsWith('Claude')
                  ? 'Claude'
                  : 'OpenAI'
              : yellowPlayer === AI_PLAYERS.HUMAN
              ? 'Human'
              : yellowPlayer.startsWith('Claude')
                ? 'Claude'
                : 'OpenAI'}
          </span>
          {isAIThinking && (
            <Loader2 className='w-6 h-6 animate-spin text-black stroke-[2px]' />
          )}
        </div>
      )}

      <div className='bg-blue-600 p-6 rounded-xl shadow-[0_0_30px_rgba(59,130,246,0.5)]'>
        <div className='grid grid-cols-7 gap-3 bg-blue-700 p-4 rounded-lg relative overflow-hidden'>
          {board.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className='w-12 h-12 relative'
                onClick={() => handleColumnClick(colIndex)}
              >
                {/* Permanent hole background */}
                <div className='absolute inset-0 rounded-full bg-gray-700' />

                {/* Animated game piece */}
                {cell && (
                  <div
                    className={`absolute inset-0 rounded-full ${
                      cell === 'red' ? 'bg-red-600' : 'bg-yellow-500'
                    } ${
                      lastMove?.row === rowIndex && lastMove?.col === colIndex
                        ? 'animate-drop-piece'
                        : ''
                    }`}
                    style={{
                      zIndex: lastMove?.row === rowIndex && lastMove?.col === colIndex ? 10 : 1
                    }}
                  />
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className='flex gap-4 mt-8 mb-6'>
        <div className='flex flex-col items-start'>
          <label className='text-red-600 font-semibold mb-2'>Red Player</label>
          <Select value={redPlayer} onValueChange={setRedPlayer}>
            <SelectTrigger className='w-[220px]'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={AI_PLAYERS.HUMAN}>Human</SelectItem>
              <SelectItem value={AI_PLAYERS.CLAUDE}>
                Claude 3.5 Sonnet
              </SelectItem>
              <SelectItem value={AI_PLAYERS.GPT4}>OpenAI GPT-4o</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className='flex flex-col items-start'>
          <label className='text-yellow-500 font-semibold mb-2'>
            Yellow Player
          </label>
          <Select value={yellowPlayer} onValueChange={setYellowPlayer}>
            <SelectTrigger className='w-[220px]'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={AI_PLAYERS.HUMAN}>Human</SelectItem>
              <SelectItem value={AI_PLAYERS.CLAUDE}>
                Claude 3.5 Sonnet
              </SelectItem>
              <SelectItem value={AI_PLAYERS.GPT4}>OpenAI GPT-4o</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
