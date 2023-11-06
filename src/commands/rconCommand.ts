import { type CommandDescription } from '../discord_api/command';
import { CommandResult } from '../discord_api/commandResult';
import { type Interaction } from '../discord_api/interaction';
import { GuildPermissions } from '../discord_api/permissions';
import { SlashCommandBuilder } from '../discord_api/slash_command_builder';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rcon')
        .setDescription('Send an rcon command to your active server')
        .addStringOption((option) => option.setName('command').setDescription('The command to send').setRequired(true))
        .setDefaultMemberPermissions([GuildPermissions.MANAGE_CHANNELS]),
    async execute(interaction: Interaction): Promise<CommandResult> {
        return new CommandResult('nothing', false, false);
    },
} as CommandDescription;
