import { Services } from '../database_services/services';
import { DiscordApiRoutes } from '../discord_api/apiRoutes';
import { type CommandDescription } from '../discord_api/command';
import { CommandResult } from '../discord_api/commandResult';
import { Embed } from '../discord_api/embed';
import { InteractionData, type Interaction } from '../discord_api/interaction';
import { SlashCommandBuilder } from '../discord_api/slash_command_builder';
import { TimeUtils } from '../util/timeUtils';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('view_playtest_requests')
        .setDescription('View the current outstanding playtest requests')
        .addStringOption((option) =>
            option
                .setName('game')
                .setDescription('The game to view playtest requests for')
                .setRequired(true)
                .addChoices([{ name: 'Counter-Strike 2', value: 'cs2' }])
        ),
    async execute(interaction: Interaction): Promise<CommandResult> {
        const interactionData = <InteractionData>interaction.data;

        const game = interactionData.options.find((o) => o.name === 'game')?.value;

        const playtestRequests = await Services.PlaytestRequestsSvc.GetAllWhere({ guildId: interaction.guild_id });

        const embed: Embed = {
            title: 'Playtest Requests',
            description: `Game: ${interactionData.options.find((o) => o.name === 'game')?.value}`,
            type: 'rich',
            color: 6730746,
            fields: [],
        };

        for (const key in playtestRequests) {
            const value = playtestRequests[key];

            if (value.game !== game) {
                continue;
            }

            const user = await DiscordApiRoutes.getUser(value.mainAuthor);
            const composedDate = TimeUtils.ComposeDateFromStringComponents(value.requestDate, value.requestTime);

            const easternOffset = TimeUtils.GetOffset('US/Eastern');
            composedDate.setMinutes(composedDate.getMinutes() + easternOffset);

            embed.fields?.push({
                name: `${value.mapName} by ${user.username} - (${TimeUtils.GetDiscordTimestampFromDate(composedDate)})`,
                value: `${value.id}`,
                inline: true,
            });
        }

        if (embed.fields!.length > 0) {
            const cr = new CommandResult('Use `/approve_playtest_request` to schedule', true, false);
            cr.embeds = [embed];
            console.log('returning cr');
            return cr;
        } else {
            return new CommandResult('no playtest requests :(', false, false);
        }
    },
} as CommandDescription;
