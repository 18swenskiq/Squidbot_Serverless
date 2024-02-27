import { DB_GuildSettings } from '../database_models/guildSettings';
import { DB_PlaytestRequest } from '../database_models/playtestRequest';
import { DiscordApiRoutes } from '../discord_api/apiRoutes';
import { type CommandDescription } from '../discord_api/command';
import { CommandResult } from '../discord_api/commandResult';
import { Embed } from '../discord_api/embed';
import { InteractionData, type Interaction } from '../discord_api/interaction';
import { GuildPermissions } from '../discord_api/permissions';
import { SlashCommandBuilder } from '../discord_api/slash_command_builder';
import { SteamApi } from '../steam_api/steamApi';
import { DatabaseWrapper } from '../util/databaseWrapper';
import { DatabaseQuery } from '../util/database_query/databaseQuery';
import { GenerateGuid } from '../util/guid';
import { TimeUtils } from '../util/timeUtils';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('submit_playtest_request_cs2')
        .setDescription('Submits a playtest request')
        .addStringOption((option) =>
            option.setName('map_name').setDescription('The name of the map (example: de_dust2)').setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName('workshop_id')
                .setDescription('The workshop id of the map. This will be the 10 or more digits at the end of the URL')
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName('gamemode')
                .setDescription('The gamemode of the map')
                .setRequired(true)
                .addChoices([
                    { name: 'Defuse', value: 'defuse' },
                    { name: 'Hostage', value: 'hostage' },
                ])
        )
        .addStringOption((option) =>
            option
                .setName('playtest_type')
                .setDescription('The type of the playtest')
                .setRequired(true)
                .addChoices([
                    { name: '2v2', value: '2v2' },
                    { name: '5v5', value: '5v5' },
                    { name: '10v10', value: '10v10' },
                ])
        )
        .addStringOption((option) =>
            option
                .setName('request_date')
                .setDescription('The date of your request in MM/DD/YYYY. Example: 10/29/2023 for October 29, 2023.')
                .setMinLength(8)
                .setMaxLength(10)
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName('request_time')
                .setDescription(
                    'The time of your request in HH:MM in US Eastern Time. Example: 14:00 for 2:00 PM in US Eastern Time.'
                )
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName('other_creators')
                .setDescription(
                    "Provide other creator's ids in a comma separated list. EX: 66318815247466496,132496742246514688"
                )
                .setRequired(false)
        ),
    async execute(interaction: Interaction): Promise<CommandResult> {
        const interactionData = <InteractionData>interaction.data;

        // Validate that guild has enabled CS2 playtesting
        //const guildSettings = await DatabaseWrapper.GetGuildSettings(interaction.guild_id);
        const guildSettings = await new DatabaseQuery()
            .GetObject<DB_GuildSettings>(interaction.guild_id)
            .Execute(DB_GuildSettings);

        if (guildSettings === null) {
            throw new Error('Could not find guild settings');
        }

        if (!guildSettings.playtesting.cs2.enabled) {
            return new CommandResult('CS2 Playtesting is not enabled on this server!', true, false);
        }

        const mapName = interactionData.options.find((o) => o.name === 'map_name')?.value;
        const workshopId = interactionData.options.find((o) => o.name === 'workshop_id')?.value;
        const gameMode = interactionData.options.find((o) => o.name === 'gamemode')?.value;
        const playtestType = interactionData.options.find((o) => o.name === 'playtest_type')?.value;
        const requestDate = interactionData.options.find((o) => o.name === 'request_date')?.value;
        const request_time = interactionData.options.find((o) => o.name === 'request_time')?.value;
        const otherCreators = interactionData.options.find((o) => o.name === 'other_creators')?.value;

        // Validate date isn't in the past and actually exists
        const currentDate = new Date();
        const localizedDate = new Date();
        const easternOffset = TimeUtils.GetOffset('US/Eastern');

        // Note: This is an awful way to do this. This is essentially a "reverse localized" date, where the submitted time is considered
        // GMT but comes in as EST (i.e. it will say 14:00 GMT but mean 14:00 EST). So I am instead reversing the offset from the current
        // time to see if it is in the past.
        localizedDate.setMinutes(localizedDate.getMinutes() - easternOffset);

        const requestDateComponents = requestDate?.split('/');
        if (requestDateComponents === undefined) {
            return new CommandResult('Date appears to be malformed. Please try again', true, false);
        }

        if (requestDateComponents[2].length < 4) {
            return new CommandResult('Please input 4 digits for the year', true, false);
        }

        const requestTimeComponents = request_time?.split(':');
        if (requestTimeComponents === undefined) {
            return new CommandResult('Time appears to be malformed. Please try again', true, false);
        }

        const composedRequestDateTime = TimeUtils.ComposeDateFromStringComponents(
            <string>requestDate,
            <string>request_time
        );

        if (!isFinite(composedRequestDateTime.getTime())) {
            return new CommandResult('Date/Time appears to not exist. Please try again', true, false);
        }

        if (composedRequestDateTime < localizedDate) {
            return new CommandResult(
                `Date and/or time appears to be in the past. Please try again. (Make sure you put the full year instead of just the last two difigs)`,
                true,
                false
            );
        }

        // Validate workshop link
        const map = await SteamApi.GetCSGOWorkshopMapDetail(workshopId ?? '');
        if (map === null || map.result === 9) {
            return new CommandResult(
                'Map not found. Ensure your ID is correct and that Steam is not down. If your ID is correct and Steam is up, blame Squidski.',
                true,
                false
            );
        }

        /*
        const requestBody: DB_PlaytestRequest = {
            Id: GenerateGuid(),
            mapName: <string>mapName,
            game: 'cs2',
            mainAuthor: interaction.member.user.id,
            otherAuthors: otherCreators?.split(',') ?? [],
            thumbnailImage: map.preview_url,
            requestDate: TimeUtils.GetDBFriendlyDateString(composedRequestDateTime),
            requestTime: TimeUtils.GetDBFriendlyTimeString(composedRequestDateTime),
            workshopId: <string>workshopId,
            mapType: <string>gameMode,
            playtestType: <string>playtestType,
            dateSubmitted: currentDate,
        };

        // Send to database
        await DatabaseWrapper.CreateCS2PlaytestRequest(interaction.guild_id, requestBody);
        const requestBody = new DB_PlaytestRequest();
        requestBody.Id = GenerateGuid();
        requestBody.mapName = <string>mapName;
        requestBody.game = 'cs2';
        requestBody.mainAuthor = interaction.member.user.id;
        requestBody.otherAuthors = otherCreators?.split(',') ?? [];
        requestBody.thumbnailImage = map.preview_url;
        (requestBody.requestDate = TimeUtils.GetDBFriendlyDateString(composedRequestDateTime)),
            (requestBody.requestTime = TimeUtils.GetDBFriendlyTimeString(composedRequestDateTime)),
            (requestBody.workshopId = <string>workshopId);
        requestBody.mapType = <string>gameMode;
        requestBody.playtestType = <string>playtestType;
        requestBody.dateSubmitted = currentDate;

        await new DatabaseQuery()
            .PutObject<DB_PlaytestRequest>(`${interaction.guild_id}/${requestBody.Id}`, requestBody)
            .ErrorIfObjectExists()
            .Execute(DB_PlaytestRequest);
            */

        const playtestId = GenerateGuid();
        await new DatabaseQuery()
            .CreateNewObject<DB_PlaytestRequest>(`${interaction.guild_id}/${playtestId}`)
            .SetProperty('Id', playtestId)
            .SetProperty('mapName', <string>mapName)
            .SetProperty('game', 'cs2')
            .SetProperty('mainAuthor', interaction.member.user.id)
            .SetProperty('otherAuthors', otherCreators?.split(',') ?? [])
            .SetProperty('thumbnailImage', map.preview_url)
            .SetProperty('requestDate', TimeUtils.GetDBFriendlyDateString(composedRequestDateTime))
            .SetProperty('requestTime', TimeUtils.GetDBFriendlyTimeString(composedRequestDateTime))
            .SetProperty('workshopId', <string>workshopId)
            .SetProperty('mapType', <string>gameMode)
            .SetProperty('playtestType', <string>playtestType)
            .SetProperty('dateSubmitted', currentDate)
            .Execute(DB_PlaytestRequest);

        // Now that we've sent this to the DB, we can reset the offset
        composedRequestDateTime.setMinutes(composedRequestDateTime.getMinutes() + easternOffset);

        // Create embed showcasing successful request
        const embed: Embed = {
            title: `${mapName} by ${interaction.member.user.username}`,
            description: `||${playtestId}||`,
            type: 'rich',
            image: {
                url: map.preview_url,
            },
            color: 6730746,
            url: `https://steamcommunity.com/sharedfiles/filedetails/?id=${workshopId}`,
            fields: [
                {
                    name: 'Time',
                    value: `${TimeUtils.GetDiscordTimestampFromDate(composedRequestDateTime)}`,
                    inline: true,
                },
                {
                    name: 'Map Type',
                    value: <string>gameMode,
                    inline: true,
                },
                {
                    name: 'Playtest Type',
                    value: <string>playtestType,
                    inline: true,
                },
            ],
        };

        // We don't need to send this if this is in the same channel
        if (interaction.channel_id !== guildSettings.playtesting.cs2.playtestChannel) {
            // Send the embed to the playtesting channel
            await DiscordApiRoutes.createNewMessage(
                guildSettings.playtesting.cs2.playtestChannel,
                'New Playtest Submission',
                [embed]
            );
        }

        // Send a message to the request channel
        await DiscordApiRoutes.createNewMessage(
            guildSettings.playtesting.cs2.requestChannel,
            'New Playtest Submission',
            [embed]
        );

        const cr = new CommandResult(
            `The playtest was requested for ${TimeUtils.GetDiscordTimestampFromDate(composedRequestDateTime)}`,
            false,
            false
        );
        cr.embeds = [];
        cr.embeds.push(embed);
        return cr;
    },
} as CommandDescription;
