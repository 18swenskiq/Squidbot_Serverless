import { type CommandDescription } from '../discord_api/command';
import { CommandResult } from '../discord_api/commandResult';
import { type Interaction } from '../discord_api/interaction';
import { GuildPermissions } from '../discord_api/permissions';
import { SlashCommandBuilder } from '../discord_api/slash_command_builder';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('enable_playtesting')
        .setDescription('Enable playtesting for a specific game')
        .addStringOption((input) =>
            input
                .setName('playtest_game')
                .setDescription('The game to enable playtesting for')
                .setRequired(true)
                .addChoices([{ name: 'Counter-Strike 2', value: 'cs2' }])
        )
        .addChannelOption((input) =>
            input
                .setName('request_channel')
                .setDescription('The channel that playtest requests will be sent to')
                .setRequired(true)
        )
        .setDefaultMemberPermissions([GuildPermissions.MANAGE_CHANNELS]),
    async execute(interaction: Interaction): Promise<CommandResult> {
        return new CommandResult('nothing', false, false);
    },
} as CommandDescription;
