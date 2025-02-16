import { getPlayerDisplayName } from '@/app/utils/gameLogic'

const Scoreboard = ({ redPlayer, yellowPlayer, scores, gamesPlayed, totalGames }) => {
  return (
    <div className='bg-white p-4 rounded-lg shadow-md mb-6 w-[300px]'>
      <h2 className='text-xl font-bold mb-4 text-center'>Series Score</h2>
      <div className='flex justify-between items-center mb-2'>
        <div className='flex items-center gap-2'>
          <div className='w-4 h-4 rounded-full bg-red-600'></div>
          <span className='font-semibold'>{getPlayerDisplayName('red', redPlayer)}</span>
        </div>
        <span className='text-2xl font-bold text-red-600'>{scores.red}</span>
      </div>
      <div className='flex justify-between items-center'>
        <div className='flex items-center gap-2'>
          <div className='w-4 h-4 rounded-full bg-yellow-500'></div>
          <span className='font-semibold'>{getPlayerDisplayName('yellow', yellowPlayer)}</span>
        </div>
        <span className='text-2xl font-bold text-yellow-500'>{scores.yellow}</span>
      </div>
      <div className='mt-4 text-center text-sm text-gray-600'>
        Game {gamesPlayed} of {totalGames}
      </div>
    </div>
  )
}

export default Scoreboard
