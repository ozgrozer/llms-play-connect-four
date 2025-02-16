export const checkWin = (board, row, col, player) => {
  // Check horizontal
  for (let c = 0; c <= 3; c++) {
    if (
      board[row][c] === player &&
      board[row][c + 1] === player &&
      board[row][c + 2] === player &&
      board[row][c + 3] === player
    ) {
      return {
        hasWon: true,
        positions: [
          [row, c],
          [row, c + 1],
          [row, c + 2],
          [row, c + 3]
        ]
      }
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
      return {
        hasWon: true,
        positions: [
          [r, col],
          [r + 1, col],
          [r + 2, col],
          [r + 3, col]
        ]
      }
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
        return {
          hasWon: true,
          positions: [
            [r, c],
            [r - 1, c + 1],
            [r - 2, c + 2],
            [r - 3, c + 3]
          ]
        }
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
        return {
          hasWon: true,
          positions: [
            [r, c],
            [r + 1, c + 1],
            [r + 2, c + 2],
            [r + 3, c + 3]
          ]
        }
      }
    }
  }

  return { hasWon: false, positions: [] }
}

export const createEmptyBoard = () => {
  return Array(6)
    .fill()
    .map(() => Array(7).fill(null))
}

export const findLowestEmptyRow = (board, colIndex) => {
  for (let row = 5; row >= 0; row--) {
    if (!board[row][colIndex]) {
      return row
    }
  }
  return -1
}

export const isColumnFull = (board, colIndex) => {
  return board[0][colIndex] !== null
}

export const getPlayerDisplayName = (player, aiPlayer) => {
  if (aiPlayer === 'Human') return 'Human'
  if (aiPlayer.startsWith('Claude')) return 'Claude'
  if (aiPlayer === 'Llama 3.3 70b') return 'Llama'
  if (aiPlayer === 'X.AI Grok 2') return 'X.AI'
  return 'OpenAI'
}
