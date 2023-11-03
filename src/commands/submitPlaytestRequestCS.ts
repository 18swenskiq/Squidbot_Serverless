import { type CommandDescription } from '../discord_api/command';
import { CommandResult } from '../discord_api/commandResult';
import { InteractionData, type Interaction } from '../discord_api/interaction';
import { GuildPermissions } from '../discord_api/permissions';
import { SlashCommandBuilder } from '../discord_api/slash_command_builder';
import { SteamApi } from '../steam_api/steamApi';

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

        // Validate that server has enabled CS2 playtesting

        const mapName = interactionData.options.find((o) => o.name === 'map_name')?.value;
        const workshopId = interactionData.options.find((o) => o.name === 'workshop_id')?.value;
        const gameMode = interactionData.options.find((o) => o.name === 'gamemode')?.value;
        const requestDate = interactionData.options.find((o) => o.name === 'request_date')?.value;
        const request_time = interactionData.options.find((o) => o.name === 'request_time')?.value;

        // Validate date

        // Validate workshop link
        const map = await SteamApi.GetCSGOWorkshopMapDetail(workshopId ?? '');

        // Send to database

        const cr = new CommandResult(JSON.stringify(map), false, false);
        return cr;
    },
} as CommandDescription;
