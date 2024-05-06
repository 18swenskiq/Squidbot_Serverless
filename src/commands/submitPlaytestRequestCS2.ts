import { GuildSettings } from '../database_models/guildSettings';
import { PlaytestRequest } from '../database_models/playtestRequest';
import { DiscordApiRoutes } from '../discord_api/apiRoutes';
import { type CommandDescription } from '../discord_api/command';
import { CommandResult } from '../discord_api/commandResult';
import { Embed } from '../discord_api/embed';
import { InteractionData, type Interaction } from '../discord_api/interaction';
import { SlashCommandBuilder } from '../discord_api/slash_command_builder';
import { CS2PlaytestGameMode } from '../enums/CS2PlaytestGameMode';
import { CS2PlaytestType } from '../enums/CS2PlaytestType';
import { Game } from '../enums/Game';
import { SteamApi } from '../steam_api/steamApi';
import { AppDataSource } from '../util/data-source';
import { DatabaseRepository } from '../util/databaseRepository';
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
                    { name: 'Defuse', value: CS2PlaytestGameMode.DEFUSE },
                    { name: 'Hostage', value: CS2PlaytestGameMode.HOSTAGE },
                ])
        )
        .addStringOption((option) =>
            option
                .setName('playtest_type')
                .setDescription('The type of the playtest')
                .setRequired(true)
                .addChoices([
                    { name: '2v2', value: CS2PlaytestType.WINGMAN },
                    { name: '5v5', value: CS2PlaytestType.CLASSIC },
                    { name: '10v10', value: CS2PlaytestType.CASUAL },
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
        const guildSettings = await DatabaseRepository.GetEntityBy(GuildSettings, [{ id: interaction.guild_id }]);

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

        const requestRepository = AppDataSource.getRepository(PlaytestRequest);

        const request = new PlaytestRequest();
        request.mapName = <string>mapName;
        request.game = Game.cs2;
        request.mainAuthor = interaction.member.user.id;
        request.otherAuthors = otherCreators?.split(',') ?? [];
        request.thumbnailImage = map.preview_url;
        request.requestDate = TimeUtils.GetDBFriendlyDateString(composedRequestDateTime);
        request.requestTime = TimeUtils.GetDBFriendlyTimeString(composedRequestDateTime);
        request.workshopId = <string>workshopId;
        request.mapType = <CS2PlaytestGameMode>gameMode;
        request.playtestType = <CS2PlaytestType>playtestType;
        request.dateSubmitted = currentDate;

        await requestRepository.save(request);

        // Now that we've sent this to the DB, we can reset the offset
        composedRequestDateTime.setMinutes(composedRequestDateTime.getMinutes() + easternOffset);

        // Create embed showcasing successful request
        const embed: Embed = {
            title: `${mapName} by ${interaction.member.user.username}`,
            description: `||${request.id}||`,
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
