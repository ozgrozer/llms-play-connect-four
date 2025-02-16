'use client'

const GameBoard = ({ board, handleColumnClick, lastMove, winningPositions }) => {
  return (
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
              <div className='absolute inset-0 rounded-full bg-gray-700 shadow-[inset_0_3px_4px_rgba(0,0,0,0.3)]' />

              {/* Animated game piece */}
              {cell && (
                <div
                  className={`absolute inset-0 rounded-full ${
                    cell === 'red' ? 'bg-red-600' : 'bg-yellow-500'
                  } ${
                    lastMove?.row === rowIndex && lastMove?.col === colIndex
                      ? 'animate-drop-piece'
                      : ''
                  } ${
                    winningPositions.some(
                      ([row, col]) => row === rowIndex && col === colIndex
                    )
                      ? 'ring-4 ring-white ring-opacity-75 animate-pulse'
                      : ''
                  }`}
                  style={{
                    zIndex:
                      lastMove?.row === rowIndex && lastMove?.col === colIndex
                        ? 10
                        : 1
                  }}
                />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default GameBoard
