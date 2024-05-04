import { type CommandDescription } from '../discord_api/command';
import { CommandResult } from '../discord_api/commandResult';
import { InteractionData, type Interaction } from '../discord_api/interaction';
import { GuildPermissions } from '../discord_api/permissions';
import { SlashCommandBuilder } from '../discord_api/slash_command_builder';
import { DatabaseWrapper } from '../util/databaseWrapper';

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
        .addChannelOption((input) =>
            input
                .setName('announce_channel')
                .setDescription('The channel that will be used for playtest announcements')
                .setRequired(true)
        )
        .addChannelOption((input) =>
            input
                .setName('playtest_channel')
                .setDescription('The channel that is used for general playtest chat')
                .setRequired(true)
        )
        .addChannelOption((input) =>
            input
                .setName('competitive_channel')
                .setDescription('The channel that is used for competitive testing')
                .setRequired(true)
        )
        .setDefaultMemberPermissions([GuildPermissions.MANAGE_CHANNELS]),
    async execute(interaction: Interaction): Promise<CommandResult> {
        const interactionData = <InteractionData>interaction.data;

        const playtestGame = interactionData.options.find((o) => o.name === 'playtest_game')?.value;
        const requestChannel = interactionData.options.find((o) => o.name === 'request_channel')?.value;
        const announceChannel = interactionData.options.find((o) => o.name === 'announce_channel')?.value;
        const playtestChannel = interactionData.options.find((o) => o.name === 'playtest_channel')?.value;
        const competitiveChannel = interactionData.options.find((o) => o.name === 'competitive_channel')?.value;

        if (playtestGame === 'cs2') {
            /*
            await new DatabaseQuery()
                .ModifyObject<DB_GuildSettings>(interaction.guild_id)
                .SetProperty('playtesting', {
                    cs2: {
                        requestChannel: <string>requestChannel,
                        announceChannel: <string>announceChannel,
                        playtestChannel: <string>playtestChannel,
                        competitiveChannel: <string>competitiveChannel,
                        enabled: true,
                    },
                })
                .Execute(DB_GuildSettings);

                */
            return new CommandResult('Enabled CS2 playtesting on this server!', true, false);
        } else {
            return new CommandResult('Unexpected game provided', true, false);
        }
    },
} as CommandDescription;
