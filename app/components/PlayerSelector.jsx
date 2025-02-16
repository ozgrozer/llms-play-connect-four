'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { AI_PLAYERS } from '@/app/constants/game'

const PlayerSelector = ({ color, player, onPlayerChange }) => {
  return (
    <div className='flex flex-col items-start'>
      <label
        className={`${
          color === 'red' ? 'text-red-600' : 'text-yellow-500'
        } font-semibold mb-2`}
      >
        {color === 'red' ? 'Red' : 'Yellow'} Player
      </label>
      <Select value={player} onValueChange={onPlayerChange}>
        <SelectTrigger className='w-[220px]'>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={AI_PLAYERS.HUMAN}>Human</SelectItem>
          <SelectItem value={AI_PLAYERS.CLAUDE}>Claude 3.5 Sonnet</SelectItem>
          <SelectItem value={AI_PLAYERS.GPT4}>OpenAI GPT-4o</SelectItem>
          <SelectItem value={AI_PLAYERS.LLAMA}>Llama 3.3 70b</SelectItem>
          <SelectItem value={AI_PLAYERS.GROK}>X.AI Grok 2</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

export default PlayerSelector
