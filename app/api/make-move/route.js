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

CRITICAL RULES:
1. IMMEDIATELY block if opponent has 3 in a row (horizontally, vertically, or diagonally)
2. IMMEDIATELY play if you can win with 4 in a row
3. If neither 1 nor 2 applies, follow the strategic priorities below

Your goal is to WIN the game by:
1. Creating a line of four of your pieces
2. Blocking your opponent from creating a line of four
3. Setting up multiple winning possibilities

Strategic tips:
- SCAN THE BOARD for any 3-in-a-row patterns that need immediate blocking
- Count consecutive pieces in all directions (horizontal, vertical, diagonal)
- Control the center columns when possible
- Look for opportunities to create multiple threats
- Block opponent's potential winning moves BEFORE creating your own opportunities
- Avoid moves that help your opponent win
- Think two moves ahead

Pattern Recognition:
- "XXX_" (3 pieces with an open space) = IMMEDIATE THREAT, must block or play
- "XX_X" (3 pieces split) = IMMEDIATE THREAT, must block or play
- "X_XX" (3 pieces split) = IMMEDIATE THREAT, must block or play
- Where X is either your pieces for winning or opponent's pieces for blocking

You MUST ONLY choose from the available columns that will be provided.
Respond with ONLY a single digit number representing your strategically chosen column.`

export async function POST (request) {
  let availableColumns = []
  const MAX_RETRIES = 3 // Maximum number of retries for invalid responses

  try {
    const { board, currentPlayer, model } = await request.json()

    // Check which columns are available
    availableColumns = []
    for (let col = 0; col < 7; col++) {
      if (board[0][col] === null) { // If top row is null, column has space
        availableColumns.push(col)
      }
    }

    if (availableColumns.length === 0) {
      return NextResponse.json({ error: 'No valid moves available' }, { status: 400 })
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

    const getPrompt = (retryCount) => `${visualBoard}
You are playing as ${currentPlayer.toUpperCase()}.
Available columns: ${availableColumns.join(', ')}
${retryCount > 0 ? `\nYour previous response was invalid. You MUST choose from these columns: ${availableColumns.join(', ')}.\n` : ''}

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
        console.log(`Claude raw response (attempt ${retryCount + 1}):`, responseText)

        column = parseInt(responseText)
        if (!isNaN(column) && availableColumns.includes(column)) {
          console.log('Claude chose valid column:', column)
          return NextResponse.json({ column })
        }

        console.log(`Claude chose invalid column (attempt ${retryCount + 1}):`, responseText)
        retryCount++
      }

      // If all retries failed, use fallback
      console.log('Claude failed after', MAX_RETRIES, 'attempts, using fallback')
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
        console.log(`GPT-4 raw response (attempt ${retryCount + 1}):`, responseText)

        column = parseInt(responseText)
        if (!isNaN(column) && availableColumns.includes(column)) {
          console.log('GPT-4 chose valid column:', column)
          return NextResponse.json({ column })
        }

        console.log(`GPT-4 chose invalid column (attempt ${retryCount + 1}):`, responseText)
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
