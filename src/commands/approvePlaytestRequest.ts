import { DB_GuildSettings } from '../database_models/guildSettings';
import { DB_PlaytestRequest } from '../database_models/playtestRequest';
import { DB_ScheduledPlaytest } from '../database_models/scheduledPlaytest';
import { DiscordApiRoutes } from '../discord_api/apiRoutes';
import { type CommandDescription } from '../discord_api/command';
import { CommandResult } from '../discord_api/commandResult';
import { GuildEventEntityType } from '../discord_api/guildEventEntityType';
import { InteractionData, type Interaction } from '../discord_api/interaction';
import { GuildPermissions } from '../discord_api/permissions';
import { SlashCommandBuilder } from '../discord_api/slash_command_builder';
import { DatabaseWrapper } from '../util/databaseWrapper';
import { DatabaseQuery } from '../util/database_query/databaseQuery';
import { GenerateGuid } from '../util/guid';
import { TimeUtils } from '../util/timeUtils';

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
        .addStringOption((option) =>
            option
                .setName('server')
                .setDescription(
                    'The server that the playtest will be on. This will be your IP:Port. Ex: can.sediscord.com:27015'
                )
                .setRequired(true)
        )
        .setDefaultMemberPermissions([GuildPermissions.MANAGE_CHANNELS]),
    async execute(interaction: Interaction): Promise<CommandResult> {
        const interactionData = <InteractionData>interaction.data;
        const id = interactionData.options.find((o) => o.name === 'playtest_id')?.value;
        const server = interactionData.options.find((o) => o.name === 'server')?.value;

        if (!server?.includes(':')) {
            return new CommandResult('Server is not formatted as IP:Port', false, false);
        }

        // Create scheduled playtest object
        // const request = await DatabaseWrapper.GetPlaytestRequest(interaction.guild_id, <Guid>id);
        const request = await new DatabaseQuery()
            .GetObject<DB_PlaytestRequest>(`${interaction.guild_id}/${id}`)
            .Execute(DB_PlaytestRequest);

        if (request === null) {
            throw new Error('Scheduled playtest not found');
        }

        if (request.game !== 'cs2') {
            return new CommandResult('unsupported game :(', false, false);
        }

        const requestMonth = request.requestDate.split('/')[0];
        const requestDay = request.requestDate.split('/')[1];
        const requestYear = request.requestDate.split('/')[2];

        const easternOffset = TimeUtils.GetOffset('US/Eastern');

        const newDateString = `${requestYear}-${requestMonth.padStart(2, '0')}-${requestDay.padStart(2, '0')}T${
            request.requestTime
        }:00.000Z`;
        const newDate = new Date(newDateString);
        newDate.setMinutes(newDate.getMinutes() + easternOffset);

        // Add playtest to event calendar
        // const playtestSettings = (await DatabaseWrapper.GetGuildSettings(interaction.guild_id)).playtesting.cs2;

        const startTime = newDate.toISOString();
        const endTimeDate = TimeUtils.GetNewDateFromAddMinutes(newDate, 90);

        const authorName = (await DiscordApiRoutes.getUser(request.mainAuthor)).username;

        const playtestId = GenerateGuid();

        // Validate server
        const servers = await DatabaseWrapper.GetGameServers(interaction.guild_id);
        const inputServerArray = server.split(':');
        const selectedServer = servers.find((s) => s.ip === inputServerArray[0] && s.port === inputServerArray[1]);

        if (selectedServer == null) {
            return new CommandResult('Provided playtest server was not found, could not approve', false, false);
        }

        const description = [
            `Game: ${request.game}`,
            `Server: ${selectedServer.ip}:${selectedServer.port}`,
            `Playtest Type: ${request.playtestType}`,
            `Map Type: ${request.mapType}`,
            `Workshop Link: https://steamcommunity.com/sharedfiles/filedetails/?id=${request.workshopId}`,
            `Other Authors: ${request.otherAuthors.join(', ')}`,
            `Moderator: ${interaction.member.user.username}`,
            `Playtest Id: ${playtestId}`,
        ];

        const eventId = await DiscordApiRoutes.createGuildEvent(
            interaction.guild_id,
            { location: 'CS2 Level Testing Channel' },
            `${request.mapName} by ${authorName}`,
            startTime,
            endTimeDate.toISOString(),
            GuildEventEntityType.EXTERNAL,
            description.join('\n')
        );

        /*
        const scheduledPlaytest: DB_ScheduledPlaytest = {
            Id: playtestId,
            game: request.game,
            mapName: request.mapName,
            mainAuthor: request.mainAuthor,
            otherAuthors: request.otherAuthors,
            thumbnailImage: request.thumbnailImage,
            playtestTime: newDate,
            workshopId: request.workshopId,
            mapType: request.mapType,
            playtestType: request.playtestType,
            moderator: interaction.member.user.id,
            eventId: eventId,
            server: <string>server,
        };

        await DatabaseWrapper.CreateScheduledPlaytest(interaction.guild_id, scheduledPlaytest);
        */

        await new DatabaseQuery()
            .CreateNewObject<DB_ScheduledPlaytest>(`${interaction.guild_id}/${playtestId}`)
            .SetProperty('Id', playtestId)
            .SetProperty('game', request.game)
            .SetProperty('mapName', request.mapName)
            .SetProperty('mainAuthor', request.mainAuthor)
            .SetProperty('otherAuthors', request.otherAuthors)
            .SetProperty('thumbnailImage', request.thumbnailImage)
            .SetProperty('playtestTime', newDate)
            .SetProperty('workshopId', request.workshopId)
            .SetProperty('mapType', request.mapType)
            .SetProperty('playtestType', request.playtestType)
            .SetProperty('moderator', interaction.member.user.id)
            .SetProperty('eventId', eventId)
            .SetProperty('server', <string>server)
            .Execute(DB_ScheduledPlaytest);

        // Post announcement in announcement channel
        const guildSettings = await new DatabaseQuery()
            .GetObject<DB_GuildSettings>(interaction.guild_id)
            .Execute(DB_GuildSettings);

        if (guildSettings === null) {
            throw new Error('Unable to find guild settings in database');
        }

        await DiscordApiRoutes.createNewMessage(
            guildSettings.playtesting.cs2.announceChannel,
            `New Playtest Event - https://discord.com/events/${interaction.guild_id}/${eventId}`
        );

        // Remove request object
        // await DatabaseWrapper.DeletePlaytestRequest(interaction.guild_id, <Guid>request.Id);
        await new DatabaseQuery()
            .DeleteObject<DB_PlaytestRequest>(`${interaction.guild_id}/${id}`)
            .Execute(DB_PlaytestRequest);

        return new CommandResult('Playtest Scheduled', false, false);
    },
} as CommandDescription;
