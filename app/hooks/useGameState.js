'use client'

import { useState, useEffect } from 'react'
import { AI_PLAYERS } from '@/app/constants/game'
import { checkWin, createEmptyBoard, findLowestEmptyRow, isColumnFull } from '@/app/utils/gameLogic'

// Add type definition for fetch
/** @type {typeof globalThis.fetch} */
const fetch = globalThis.fetch

export const useGameState = () => {
  const [board, setBoard] = useState(createEmptyBoard())
  const [currentPlayer, setCurrentPlayer] = useState('red')
  const [winner, setWinner] = useState(null)
  const [redPlayer, setRedPlayer] = useState(AI_PLAYERS.HUMAN)
  const [yellowPlayer, setYellowPlayer] = useState(AI_PLAYERS.HUMAN)
  const [isAIThinking, setIsAIThinking] = useState(false)
  const [lastMove, setLastMove] = useState(null)
  const [winningPositions, setWinningPositions] = useState([])

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

      await handleColumnClick(data.column, true)
    } catch (error) {
      console.log('Error getting AI move:', error)
    }
    setIsAIThinking(false)
  }

  const resetGame = () => {
    setBoard(createEmptyBoard())
    setCurrentPlayer('red')
    setWinner(null)
    setIsAIThinking(false)
    setLastMove(null)
    setWinningPositions([])

    // Trigger AI move if red player is AI
    if (redPlayer !== AI_PLAYERS.HUMAN) {
      setTimeout(() => makeAIMove(), 500)
    }
  }

  const handleColumnClick = async (colIndex, isAIMove = false) => {
    if (winner || (isAIThinking && !isAIMove)) return

    const currentAIPlayer = getCurrentAIPlayer()
    if (currentAIPlayer && !isAIMove) return

    if (isColumnFull(board, colIndex)) {
      console.log('Column is full, cannot make move')
      return
    }

    const rowIndex = findLowestEmptyRow(board, colIndex)
    if (rowIndex === -1) return

    const newBoard = board.map(row => [...row])
    newBoard[rowIndex][colIndex] = currentPlayer
    setBoard(newBoard)
    setLastMove({ row: rowIndex, col: colIndex })

    await new Promise(resolve => setTimeout(resolve, 500))

    const winResult = checkWin(newBoard, rowIndex, colIndex, currentPlayer)
    if (winResult.hasWon) {
      setWinner(currentPlayer)
      setWinningPositions(winResult.positions)
      return
    }

    setCurrentPlayer(currentPlayer === 'red' ? 'yellow' : 'red')
  }

  useEffect(() => {
    let timeoutId
    const aiPlayer = getCurrentAIPlayer()

    if (aiPlayer && !winner && !isAIThinking) {
      timeoutId = setTimeout(() => makeAIMove(), 1000)
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [currentPlayer, winner])

  return {
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
  }
}
