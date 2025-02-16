import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

const SYSTEM_PROMPT = `You are playing Connect Four. The board is 6 rows (0-5) and 7 columns (0-6).
Empty spaces are null, your pieces are marked as your color ('red' or 'yellow').
Analyze the board and choose the best column (0-6) to place your piece.
IMPORTANT: You must check if the column has any empty spaces (null) before choosing it.
If a column is full (no null spaces), you cannot choose that column.
Respond with ONLY a number 0-6 representing your chosen column.
Make sure your chosen column has at least one empty (null) space.`

export async function POST (request) {
  try {
    const { board, currentPlayer, model } = await request.json()

    // Check which columns are available
    const availableColumns = []
    for (let col = 0; col < 7; col++) {
      if (board[0][col] === null) { // If top row is null, column has space
        availableColumns.push(col)
      }
    }

    if (availableColumns.length === 0) {
      return NextResponse.json({ error: 'No valid moves available' }, { status: 400 })
    }

    const boardStr = JSON.stringify(board)
    const movePrompt = `Current board state:\n${boardStr}\nYou are playing as ${currentPlayer}. Available columns are: ${availableColumns.join(', ')}. Which column do you choose (must be one of the available columns)?`

    if (model === 'Claude 3.5 Sonnet') {
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 5,
        temperature: 0.7,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: movePrompt
          }
        ]
      })

      // Extract just the number from Claude's response
      const responseText = response.content[0].text.trim()
      const columnMatch = responseText.match(/\d+/)
      if (!columnMatch) {
        throw new Error('Invalid column response from Claude')
      }

      const column = parseInt(columnMatch[0])
      if (isNaN(column) || column < 0 || column > 6 || !availableColumns.includes(column)) {
        throw new Error('Invalid column response from Claude')
      }

      return NextResponse.json({ column })
    } else if (model === 'OpenAI GPT-4o') {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: movePrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 5
      })

      const column = parseInt(response.choices[0].message.content.trim())
      if (isNaN(column) || column < 0 || column > 6 || !availableColumns.includes(column)) {
        throw new Error('Invalid column response from GPT-4o')
      }

      return NextResponse.json({ column })
    }

    throw new Error('Unsupported model')
  } catch (error) {
    console.error('Error in make-move:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to make move' },
      { status: 500 }
    )
  }
}
