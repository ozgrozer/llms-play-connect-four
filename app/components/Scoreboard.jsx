import { getPlayerDisplayName } from '@/app/utils/gameLogic'

const Scoreboard = ({
  redPlayer,
  yellowPlayer,
  scores,
  gamesPlayed,
  totalGames
}) => {
  return (
    <div className='bg-white p-4 rounded-2xl shadow-lg mb-6 w-[250px]'>
      <div className='flex flex-col gap-2'>
        <h2 className='text-lg font-black text-center tracking-wider'>
          GAME {gamesPlayed + 1} OF {totalGames}
        </h2>

        <div className='grid grid-cols-2 gap-2 text-center'>
          <span className='text-base font-black text-red-500'>
            {getPlayerDisplayName('red', redPlayer).toUpperCase()}
          </span>
          <span className='text-base font-black text-yellow-400'>
            {getPlayerDisplayName('yellow', yellowPlayer).toUpperCase()}
          </span>
        </div>

        <div className='grid grid-cols-2 gap-2 text-center'>
          <span className='text-2xl font-black'>
            {scores.red}
          </span>
          <span className='text-2xl font-black'>
            {scores.yellow}
          </span>
        </div>
      </div>
    </div>
  )
}

export default Scoreboard
