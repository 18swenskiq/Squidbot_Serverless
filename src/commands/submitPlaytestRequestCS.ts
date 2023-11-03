import { type CommandDescription } from '../discord_api/command';
import { CommandResult } from '../discord_api/commandResult';
import { InteractionData, type Interaction } from '../discord_api/interaction';
import { GuildPermissions } from '../discord_api/permissions';
import { SlashCommandBuilder } from '../discord_api/slash_command_builder';
import { SteamApi } from '../steam_api/steamApi';
import { DatabaseWrapper } from '../util/databaseWrapper';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('submit_playtest_request_cs2')
        .setDescription('Submits a playtest request')
        .setDefaultMemberPermissions([GuildPermissions.MANAGE_CHANNELS])
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
                    { name: '5v5 - Defuse', value: 'defuse' },
                    { name: '5v5 - Hostage', value: 'hostage' },
                    //{ name: '2v2 - Defuse', value: 'wingman_defuse' },
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
        ),
    async execute(interaction: Interaction): Promise<CommandResult> {
        const interactionData = <InteractionData>interaction.data;

        // Validate that guild has enabled CS2 playtesting
        const guildSettings = await DatabaseWrapper.GetGuildSettings(interaction.guild_id);
        guildSettings.

        const mapName = interactionData.options.find((o) => o.name === 'map_name')?.value;
        const workshopId = interactionData.options.find((o) => o.name === 'workshop_id')?.value;
        const gameMode = interactionData.options.find((o) => o.name === 'gamemode')?.value;
        const requestDate = interactionData.options.find((o) => o.name === 'request_date')?.value;
        const request_time = interactionData.options.find((o) => o.name === 'request_time')?.value;

        // Validate date isn't in the past and actually exists
        const currentDate = new Date();

        const requestDateComponents = requestDate?.split('/');
        if (requestDateComponents === undefined) {
            return new CommandResult('Date appears to be malformed. Please try again', true, false);
        }

        const requestTimeComponents = request_time?.split(':');
        if (requestTimeComponents === undefined) {
            return new CommandResult('Time appears to be malformed. Please try again', true, false);
        }

        const composedRequestDateTime = new Date(
            Number(requestDateComponents[2]),
            Number(requestDateComponents[0]) - 1,
            Number(requestDateComponents[1]),
            Number(requestTimeComponents[0]),
            Number(requestTimeComponents[1])
        );

        if (!isFinite(composedRequestDateTime.getTime())) {
            return new CommandResult('Date/Time appears to not exist. Please try again', true, false);
        }

        if (composedRequestDateTime < currentDate) {
            return new CommandResult('Date and/or time appears to be in the past. Please try again', true, false);
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

        // Send to database

        // Create embed showcasing successful request

        const cr = new CommandResult(
            `The playtest was requested for ${composedRequestDateTime
                .toString()
                .replace('GMT+0000 (Coordinated Universal Time)', '')}`,
            false,
            false
        );
        return cr;
    },
} as CommandDescription;
