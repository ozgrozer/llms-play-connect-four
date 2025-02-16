import { getPlayerDisplayName } from '@/app/utils/gameLogic'

const Scoreboard = ({
  redPlayer,
  yellowPlayer,
  scores,
  gamesPlayed,
  totalGames
}) => {
  return (
    <div className='bg-white p-2 rounded-xl shadow-lg mb-4 w-[200px]'>
      <div className='flex flex-col gap-0.5'>
        <h2 className='text-sm font-black text-center tracking-wider'>
          GAME {Math.min(gamesPlayed + 1, totalGames)} OF {totalGames}
        </h2>

        <div className='grid grid-cols-2 gap-0.5 text-center'>
          <span className='text-xs font-black text-red-500'>
            {getPlayerDisplayName('red', redPlayer).toUpperCase()}
          </span>
          <span className='text-xs font-black text-yellow-400'>
            {getPlayerDisplayName('yellow', yellowPlayer).toUpperCase()}
          </span>
        </div>

        <div className='grid grid-cols-2 gap-0.5 text-center'>
          <span className='text-lg font-black'>{scores.red}</span>
          <span className='text-lg font-black'>{scores.yellow}</span>
        </div>
      </div>
    </div>
  )
}

export default Scoreboard
