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

        const easternOffset = getOffset('US/Eastern');

        const newDateString = `${requestYear}-${requestMonth}-${requestDay}T${request.requestTime}:00.000Z`;
        const newDate = new Date(newDateString);
        newDate.setMinutes(newDate.getMinutes() + easternOffset);

        // Add playtest to event calendar
        const playtestSettings = (await DatabaseWrapper.GetGuildSettings(interaction.guild_id)).playtesting.cs2;
        const startTime = newDate.toISOString();
        const endTimeDate = new Date(newDate.getTime() + 90 * 60000);

        const authorName = (await DiscordApiRoutes.getUser(request.mainAuthor)).username;

        const playtestId = GenerateGuid();

        const description = [
            `Game: ${request.game}`,
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
        };

        console.log('new scheduled playtest date');
        console.log(scheduledPlaytest.playtestTime);

        await DatabaseWrapper.CreateScheduledPlaytest(interaction.guild_id, scheduledPlaytest);

        // Post announcement in announcement channel
        await DiscordApiRoutes.createNewMessage(
            playtestSettings.announceChannel,
            `New Playtest Event - https://discord.com/events/${interaction.guild_id}/${eventId}`
        );

        // Remove request object
        await DatabaseWrapper.DeletePlaytestRequest(interaction.guild_id, <Guid>request.Id);

        return new CommandResult('Playtest Scheduled', false, false);
    },
} as CommandDescription;

const getOffset = (timeZone: any) => {
    const timeZoneFormat = Intl.DateTimeFormat('ia', {
        timeZoneName: 'short',
        timeZone,
    });
    const timeZoneParts = timeZoneFormat.formatToParts();
    const timeZoneName = timeZoneParts.find((i) => i.type === 'timeZoneName')!.value;
    const offset = timeZoneName.slice(3);
    if (!offset) return 0;

    const matchData = offset.match(/([+-])(\d+)(?::(\d+))?/);
    if (!matchData) throw `cannot parse timezone name: ${timeZoneName}`;

    const [, sign, hour, minute] = matchData;
    let result = parseInt(hour) * 60;
    if (sign === '+') result *= -1;
    if (minute) result += parseInt(minute);

    return result;
};
