import { DB_ScheduledPlaytest } from '../database_models/scheduledPlaytest';
import { DiscordApiRoutes } from '../discord_api/apiRoutes';
import { type CommandDescription } from '../discord_api/command';
import { CommandResult } from '../discord_api/commandResult';
import { GuildEventEntityType } from '../discord_api/guildEventEntityType';
import { InteractionData, type Interaction } from '../discord_api/interaction';
import { GuildPermissions } from '../discord_api/permissions';
import { SlashCommandBuilder } from '../discord_api/slash_command_builder';
import { DatabaseWrapper } from '../util/databaseWrapper';
import { GenerateGuid, Guid } from '../util/guid';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('approve_playtest_request')
        .setDescription('Approves a playtest request and schedules it')
        .addStringOption((option) =>
            option
                .setName('playtest_id')
                .setDescription('The id of the playtest request to approve and schedule')
                .setRequired(true)
        )
        .setDefaultMemberPermissions([GuildPermissions.MANAGE_CHANNELS]),
    async execute(interaction: Interaction): Promise<CommandResult> {
        const interactionData = <InteractionData>interaction.data;
        const id = interactionData.options.find((o) => o.name === 'playtest_id')?.value;

        // Create scheduled playtest object
        const request = await DatabaseWrapper.GetPlaytestRequest(interaction.guild_id, <Guid>id);

        if (request.game !== 'cs2') {
            return new CommandResult('unsupported game :(', false, false);
        }

        const requestMonth = request.requestDate.split('/')[0];
        const requestDay = request.requestDate.split('/')[1];
        const requestYear = request.requestDate.split('/')[2];

        const newDateString = `${requestYear}-${requestMonth}-${requestDay}T${request.requestTime}:00.000Z`;
        console.log('new date string');
        console.log(newDateString);

        const scheduledPlaytest: DB_ScheduledPlaytest = {
            Id: GenerateGuid(),
            game: request.game,
            mapName: request.mapName,
            mainAuthor: request.mainAuthor,
            otherAuthors: request.otherAuthors,
            thumbnailImage: request.thumbnailImage,
            playtestTime: new Date(newDateString),
            workshopId: request.workshopId,
            mapType: request.mapType,
            playtestType: request.playtestType,
        };

        console.log('new scheduled playtest date');
        console.log(scheduledPlaytest.playtestTime);

        await DatabaseWrapper.CreateScheduledPlaytest(interaction.guild_id, scheduledPlaytest);

        // Add playtest to event calendar
        const playtestSettings = (await DatabaseWrapper.GetGuildSettings(interaction.guild_id)).playtesting.cs2;
        const startTime = scheduledPlaytest.playtestTime.toISOString();
        const endTimeDate = new Date(scheduledPlaytest.playtestTime.getTime() + 90 * 60000);

        console.log('end date?');
        console.log(endTimeDate);

        const eventId = await DiscordApiRoutes.createGuildEvent(
            interaction.guild_id,
            playtestSettings.playtestChannel,
            { location: 'CS2 Level Testing Channel' },
            `${scheduledPlaytest.mapName} by ${scheduledPlaytest.mainAuthor}`,
            startTime,
            endTimeDate.toISOString(),
            GuildEventEntityType.VOICE,
            'placeholder description'
        );

        // Post announcement in announcement channel
        await DiscordApiRoutes.createNewMessage(
            playtestSettings.announceChannel,
            'New playtest approved blah blah blah'
        );

        // Remove request object
        await DatabaseWrapper.DeletePlaytestRequest(interaction.guild_id, <Guid>request.Id);

        return new CommandResult('yay you did it congrats', false, false);
    },
} as CommandDescription;
