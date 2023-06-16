import { type CommandDescription } from '../discord_api/command'
import { CommandResult } from '../discord_api/commandResult';
import { type Interaction } from '../discord_api/interaction'
import { SlashCommandBuilder } from '../discord_api/slash_command_builder'

module.exports = {
  data: new SlashCommandBuilder()
    .setName('test')
    .setDescription('test description'),
  async execute (interaction: Interaction): Promise<CommandResult> {
    return new CommandResult('nothing', false, false);
  }
} as CommandDescription
