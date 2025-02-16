'use client'

import { useState } from 'react'
import { Bungee } from 'next/font/google'

const bungee = Bungee({
  subsets: ['latin'],
  weight: ['400']
})

export default function ConnectFour () {
  const [board, setBoard] = useState(
    Array(6)
      .fill()
      .map(() => Array(7).fill(null))
  )
  const [currentPlayer, setCurrentPlayer] = useState('red')
  const [winner, setWinner] = useState(null)

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
  }

  const handleColumnClick = colIndex => {
    if (winner) return

    const newBoard = [...board]
    for (let row = 5; row >= 0; row--) {
      if (!newBoard[row][colIndex]) {
        newBoard[row][colIndex] = currentPlayer
        setBoard(newBoard)

        if (checkWin(newBoard, row, colIndex, currentPlayer)) {
          setWinner(currentPlayer)
          return
        }

        setCurrentPlayer(currentPlayer === 'red' ? 'yellow' : 'red')
        break
      }
    }
  }

  return (
    <div
      className={`flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 ${bungee.className}`}
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
            {winner.charAt(0).toUpperCase() + winner.slice(1)} wins!
          </span>
        </div>
      ) : (
        <div className='mb-6 text-2xl font-semibold text-gray-700'>
          Current Player:{' '}
          <span
            className={`${
              currentPlayer === 'red' ? 'text-red-600' : 'text-yellow-500'
            } inline-block transition-transform duration-300 hover:scale-110`}
          >
            {currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)}
          </span>
        </div>
      )}

      <div className='bg-blue-600 p-6 rounded-xl shadow-[0_0_30px_rgba(59,130,246,0.5)]'>
        <div className='grid grid-cols-7 gap-3 bg-blue-700 p-4 rounded-lg'>
          {board.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className='relative w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center cursor-pointer transform hover:scale-105 transition-transform duration-150 shadow-inner'
                onClick={() => handleColumnClick(colIndex)}
              >
                {cell && (
                  <div
                    className={`
                      absolute w-14 h-14 rounded-full
                      ${cell === 'red' ? 'bg-red-500' : 'bg-yellow-400'}
                      transition-all duration-300 ease-out
                      shadow-lg
                      ${
                        cell === 'red'
                          ? 'shadow-red-700/50'
                          : 'shadow-yellow-600/50'
                      }
                      animate-drop-piece
                    `}
                  />
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <button
        onClick={resetGame}
        className='mt-8 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg
                 font-semibold text-lg shadow-md hover:from-blue-600 hover:to-blue-700
                 transform hover:scale-105 transition-all duration-200
                 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50'
      >
        New Game
      </button>
    </div>
  )
}
