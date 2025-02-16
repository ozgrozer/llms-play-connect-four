import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

const SYSTEM_PROMPT = `You are playing Connect Four, aiming to win by connecting 4 pieces horizontally, vertically, or diagonally.
The board is 6 rows (0-5, bottom to top) and 7 columns (0-6, left to right).
Empty spaces are null, your pieces are marked as your color ('red' or 'yellow').

CRITICAL RULES - FOLLOW THIS ORDER STRICTLY:
1. WIN IMMEDIATELY if you can connect 4 pieces
2. BLOCK IMMEDIATELY if opponent has 3 connected pieces with an open space
3. If neither 1 nor 2 applies, follow the strategic priorities below

Your goal is to WIN the game by:
1. Creating a line of four of your pieces
2. Blocking your opponent from creating a line of four
3. Setting up multiple winning possibilities

THREAT DETECTION (HIGHEST PRIORITY):
- IMMEDIATELY scan the entire board for these patterns:
  * "XXX_" (3 pieces with an open space)
  * "XX_X" (3 pieces split)
  * "X_XX" (3 pieces split)
  Where X is either:
  - Your color (to win immediately)
  - Opponent's color (to block immediately)

BLOCKING RULES:
1. If opponent has 3 pieces connected with an open space, you MUST block it
2. If opponent has multiple threats, block the most immediate threat
3. Block BEFORE attempting your own winning moves (unless you can win this turn)
4. When in doubt, block the threat

Strategic tips:
- ALWAYS check for immediate threats before making any other move
- Count consecutive pieces in all directions (horizontal, vertical, diagonal)
- Control the center columns when possible
- Look for opportunities to create multiple threats
- Think two moves ahead
- Avoid moves that give your opponent a winning opportunity

You MUST ONLY choose from the available columns that will be provided.
Respond with ONLY a single digit number representing your strategically chosen column.`

// Add helper functions to check for immediate threats
function checkForThreats (board, player) {
  const threats = []
  const opponent = player === 'red' ? 'yellow' : 'red'

  // Helper to check if a position is valid and empty
  const isValidEmpty = (row, col) => {
    return (
      row >= 0 && row < 6 && col >= 0 && col < 7 && board[row][col] === null
    )
  }

  // Helper to check if a position has a specific player's piece
  const isPlayer = (row, col, checkPlayer) => {
    return (
      row >= 0 &&
      row < 6 &&
      col >= 0 &&
      col < 7 &&
      board[row][col] === checkPlayer
    )
  }

  // Check horizontal threats
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 4; col++) {
      // Check pattern XXX_
      if (
        isPlayer(row, col, opponent) &&
        isPlayer(row, col + 1, opponent) &&
        isPlayer(row, col + 2, opponent) &&
        isValidEmpty(row, col + 3)
      ) {
        threats.push({ col: col + 3, priority: 1 })
      }
      // Check pattern XX_X
      if (
        isPlayer(row, col, opponent) &&
        isPlayer(row, col + 1, opponent) &&
        isValidEmpty(row, col + 2) &&
        isPlayer(row, col + 3, opponent)
      ) {
        threats.push({ col: col + 2, priority: 1 })
      }
      // Check pattern X_XX
      if (
        isPlayer(row, col, opponent) &&
        isValidEmpty(row, col + 1) &&
        isPlayer(row, col + 2, opponent) &&
        isPlayer(row, col + 3, opponent)
      ) {
        threats.push({ col: col + 1, priority: 1 })
      }
    }
  }

  // Check vertical threats
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 7; col++) {
      if (
        isPlayer(row, col, opponent) &&
        isPlayer(row + 1, col, opponent) &&
        isPlayer(row + 2, col, opponent) &&
        isValidEmpty(row + 3, col)
      ) {
        threats.push({ col: col, priority: 1 })
      }
    }
  }

  // Check diagonal threats (positive slope)
  for (let row = 3; row < 6; row++) {
    for (let col = 0; col < 4; col++) {
      // Check pattern XXX_
      if (
        isPlayer(row, col, opponent) &&
        isPlayer(row - 1, col + 1, opponent) &&
        isPlayer(row - 2, col + 2, opponent) &&
        isValidEmpty(row - 3, col + 3)
      ) {
        threats.push({ col: col + 3, priority: 1 })
      }
    }
  }

  // Check diagonal threats (negative slope)
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 4; col++) {
      // Check pattern XXX_
      if (
        isPlayer(row, col, opponent) &&
        isPlayer(row + 1, col + 1, opponent) &&
        isPlayer(row + 2, col + 2, opponent) &&
        isValidEmpty(row + 3, col + 3)
      ) {
        threats.push({ col: col + 3, priority: 1 })
      }
    }
  }

  return threats
}

// Add helper function to check for winning moves
function checkForWinningMove (board, player) {
  const winningMoves = []

  // Helper to check if a position is valid and empty
  const isValidEmpty = (row, col) => {
    return row >= 0 && row < 6 && col >= 0 && col < 7 && board[row][col] === null
  }

  // Helper to check if a position has a specific player's piece
  const isPlayer = (row, col, checkPlayer) => {
    return row >= 0 && row < 6 && col >= 0 && col < 7 && board[row][col] === checkPlayer
  }

  // Check horizontal winning moves
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 4; col++) {
      // Check pattern XXX_
      if (
        isPlayer(row, col, player) &&
        isPlayer(row, col + 1, player) &&
        isPlayer(row, col + 2, player) &&
        isValidEmpty(row, col + 3)
      ) {
        winningMoves.push(col + 3)
      }
      // Check pattern XX_X
      if (
        isPlayer(row, col, player) &&
        isPlayer(row, col + 1, player) &&
        isValidEmpty(row, col + 2) &&
        isPlayer(row, col + 3, player)
      ) {
        winningMoves.push(col + 2)
      }
      // Check pattern X_XX
      if (
        isPlayer(row, col, player) &&
        isValidEmpty(row, col + 1) &&
        isPlayer(row, col + 2, player) &&
        isPlayer(row, col + 3, player)
      ) {
        winningMoves.push(col + 1)
      }
    }
  }

  // Check vertical winning moves
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 7; col++) {
      if (
        isPlayer(row, col, player) &&
        isPlayer(row + 1, col, player) &&
        isPlayer(row + 2, col, player) &&
        isValidEmpty(row + 3, col)
      ) {
        winningMoves.push(col)
      }
    }
  }

  // Check diagonal winning moves (positive slope)
  for (let row = 3; row < 6; row++) {
    for (let col = 0; col < 4; col++) {
      if (
        isPlayer(row, col, player) &&
        isPlayer(row - 1, col + 1, player) &&
        isPlayer(row - 2, col + 2, player) &&
        isValidEmpty(row - 3, col + 3)
      ) {
        winningMoves.push(col + 3)
      }
    }
  }

  // Check diagonal winning moves (negative slope)
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 4; col++) {
      if (
        isPlayer(row, col, player) &&
        isPlayer(row + 1, col + 1, player) &&
        isPlayer(row + 2, col + 2, player) &&
        isValidEmpty(row + 3, col + 3)
      ) {
        winningMoves.push(col + 3)
      }
    }
  }

  return winningMoves
}

export async function POST (request) {
  let availableColumns = []
  const MAX_RETRIES = 3

  try {
    const { board, currentPlayer, model } = await request.json()

    // Check which columns are available
    availableColumns = []
    for (let col = 0; col < 7; col++) {
      if (board[0][col] === null) {
        availableColumns.push(col)
      }
    }

    if (availableColumns.length === 0) {
      return NextResponse.json(
        { error: 'No valid moves available' },
        { status: 400 }
      )
    }

    // First, check for winning moves
    const winningMoves = checkForWinningMove(board, currentPlayer)
    const validWinningMoves = winningMoves.filter(col => availableColumns.includes(col))
    if (validWinningMoves.length > 0) {
      console.log('Found winning move at column:', validWinningMoves[0])
      return NextResponse.json({ column: validWinningMoves[0] })
    }

    // Then check for opponent threats that need blocking
    const threats = checkForThreats(board, currentPlayer)
    if (threats.length > 0) {
      const validThreats = threats
        .filter(threat => availableColumns.includes(threat.col))
        .sort((a, b) => a.priority - b.priority)

      if (validThreats.length > 0) {
        console.log('Found immediate threat, blocking at column:', validThreats[0].col)
        return NextResponse.json({ column: validThreats[0].col })
      }
    }

    // Create a visual representation of the board
    let visualBoard = '\n'
    for (let row = 0; row < 6; row++) {
      let rowStr = '|'
      for (let col = 0; col < 7; col++) {
        if (board[row][col] === null) rowStr += ' ·'
        else if (board[row][col] === 'red') rowStr += ' R'
        else rowStr += ' Y'
      }
      visualBoard += rowStr + ' |\n'
    }
    visualBoard += '+--------------+\n |0 1 2 3 4 5 6|\n'

    const getPrompt = retryCount => `${visualBoard}
You are playing as ${currentPlayer.toUpperCase()}.
Available columns: ${availableColumns.join(', ')}
${
  retryCount > 0
    ? `\nYour previous response was invalid. You MUST choose from these columns: ${availableColumns.join(
        ', '
      )}.\n`
    : ''
}

Analyze the board carefully:
1. Look for any immediate winning moves
2. Block opponent's potential winning moves
3. Create opportunities for future winning moves
4. Control the center of the board when possible
5. Avoid moves that give your opponent a winning opportunity

Choose the best strategic move from the available columns.
Respond with ONLY the column number.`

    console.log('\n=== Connect Four Move Request ===')
    console.log('Model:', model)
    console.log('Player:', currentPlayer)
    console.log('Available columns:', availableColumns)
    console.log('Board state:', visualBoard)

    if (model === 'Claude 3.5 Sonnet') {
      let retryCount = 0
      let column
      while (retryCount < MAX_RETRIES) {
        const response = await anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 5,
          temperature: 0.9,
          system: SYSTEM_PROMPT,
          messages: [
            {
              role: 'user',
              content: getPrompt(retryCount)
            }
          ]
        })

        const responseText = response.content[0].text.trim()
        console.log(
          `Claude raw response (attempt ${retryCount + 1}):`,
          responseText
        )

        column = parseInt(responseText)
        if (!isNaN(column) && availableColumns.includes(column)) {
          console.log('Claude chose valid column:', column)
          return NextResponse.json({ column })
        }

        console.log(
          `Claude chose invalid column (attempt ${retryCount + 1}):`,
          responseText
        )
        retryCount++
      }

      // If all retries failed, use fallback
      console.log(
        'Claude failed after',
        MAX_RETRIES,
        'attempts, using fallback'
      )
      const fallbackColumn = chooseFallbackColumn(availableColumns)
      console.log('Using fallback column:', fallbackColumn)
      return NextResponse.json({ column: fallbackColumn })
    } else if (model === 'OpenAI GPT-4o') {
      let retryCount = 0
      let column
      while (retryCount < MAX_RETRIES) {
        const response = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: getPrompt(retryCount) }
          ],
          temperature: 0.9,
          max_tokens: 5
        })

        const responseText = response.choices[0].message.content.trim()
        console.log(
          `GPT-4 raw response (attempt ${retryCount + 1}):`,
          responseText
        )

        column = parseInt(responseText)
        if (!isNaN(column) && availableColumns.includes(column)) {
          console.log('GPT-4 chose valid column:', column)
          return NextResponse.json({ column })
        }

        console.log(
          `GPT-4 chose invalid column (attempt ${retryCount + 1}):`,
          responseText
        )
        retryCount++
      }

      // If all retries failed, use fallback
      console.log('GPT-4 failed after', MAX_RETRIES, 'attempts, using fallback')
      const fallbackColumn = chooseFallbackColumn(availableColumns)
      console.log('Using fallback column:', fallbackColumn)
      return NextResponse.json({ column: fallbackColumn })
    }

    throw new Error('Unsupported model')
  } catch (error) {
    console.error('Error in make-move:', error.message)
    try {
      // Use fallback mechanism for any errors
      const fallbackColumn = chooseFallbackColumn(availableColumns)
      console.log('Using fallback column due to error:', fallbackColumn)
      return NextResponse.json({ column: fallbackColumn })
    } catch {
      // If all else fails, return a 500 error
      return NextResponse.json(
        { error: 'Failed to make move' },
        { status: 500 }
      )
    }
  }
}

// Helper function to choose a strategic fallback column
function chooseFallbackColumn (columns) {
  // Prefer center columns when available
  const centerPreference = [3, 2, 4, 1, 5, 0, 6]
  for (const preferred of centerPreference) {
    if (columns.includes(preferred)) {
      return preferred
    }
  }
  // If no preferred columns are available, return the first available column
  return columns[0]
}
