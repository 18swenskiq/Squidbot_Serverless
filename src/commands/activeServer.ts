import { type CommandDescription } from '../discord_api/command'
import { CommandResult } from '../discord_api/commandResult';
import { type Interaction } from '../discord_api/interaction'
import { SlashCommandBuilder } from '../discord_api/slash_command_builder'

module.exports = {
  data: new SlashCommandBuilder()
    .setName('active_rcon_server')
    .setDescription('If a parameter is provided, the active RCON server can be given via a string parameter. Otherwise, the current value will be returned')
    .addStringOption(option => option
        .setName('server')
        .setDescription('The IP of the Game Server to set as active')
        .setRequired(false)),
  async execute (interaction: Interaction): Promise<CommandResult> {
    return new CommandResult('nothing', false, false);
  }
} as CommandDescription