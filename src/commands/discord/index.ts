import type { Command } from '../../commands.js'

const discord = {
  type: 'local-jsx',
  name: 'discord',
  aliases: ['db'],
  description: 'Connect to Discord for remote control from your phone',
  isEnabled: () => true,
  isHidden: false,
  immediate: true,
  load: () => import('./discord.js'),
} satisfies Command

export default discord
