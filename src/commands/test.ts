import { type CommandDescription } from '../discord_api/command'
import { type Interaction } from '../discord_api/interaction'
import { SlashCommandBuilder } from '../discord_api/slash_command_builder'

module.exports = {
  data: new SlashCommandBuilder()
    .setName('test')
    .setDescription('test description'),
  async execute (interaction: Interaction): Promise<string> {
    return 'you successfully tested this function'
  }
} as CommandDescription
