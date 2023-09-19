import { type CommandDescription } from '../discord_api/command'
import { CommandResult } from '../discord_api/commandResult';
import { type Interaction } from '../discord_api/interaction'
import { GuildPermissions } from '../discord_api/permissions';
import { SlashCommandBuilder } from '../discord_api/slash_command_builder'

module.exports = {
  data: new SlashCommandBuilder()
    .setName('add_game_server')
    .setDescription('Adds a game server that is tied to this discord server')
    .addStringOption(option => option
        .setName('game')
        .setDescription('The game that this server is for')
        .setRequired(true)
        .addChoices([{ name: 'Counter-Strike 2', value: 'cs2' }]))
    .setDefaultMemberPermissions([GuildPermissions.MANAGE_CHANNELS]),
  async execute (interaction: Interaction): Promise<CommandResult> {
    return new CommandResult('cool', false, false);
  }
} as CommandDescription
