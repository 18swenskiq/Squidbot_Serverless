import { type CommandDescription } from '../discord_api/command';
import { CommandResult } from '../discord_api/commandResult';
import { InteractionData, type Interaction } from '../discord_api/interaction';
import { GuildPermissions } from '../discord_api/permissions';
import { SlashCommandBuilder } from '../discord_api/slash_command_builder';
import { DatabaseWrapper } from '../util/databaseWrapper';
import { Guid } from '../util/guid';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('edit_playtest_request')
        .setDescription(
            'Edit a playtest request. All fields besides the Id are optional. Unused fields will not be changed'
        )
        .addStringOption((option) =>
            option.setName('playtest_id').setDescription('The Id of the playtest').setRequired(true)
        )
        .addStringOption((option) =>
            option.setName('date').setDescription('The new date of the playtest. Format: MM/DD/YYYY').setRequired(false)
        )
        .addStringOption((option) =>
            option
                .setName('time')
                .setDescription('The new time of the playtest. Format: HH:MM (in US Eastern Time)')
                .setRequired(false)
        )
        .addStringOption((option) =>
            option
                .setName('playtest_type')
                .setDescription('The type of the playtest')
                .setRequired(false)
                .addChoices([
                    { name: '5v5', value: '5v5' },
                    { name: '10v10', value: '10v10' },
                ])
        )
        .setDefaultMemberPermissions([GuildPermissions.MANAGE_CHANNELS]),
    async execute(interaction: Interaction): Promise<CommandResult> {
        const interactionData = <InteractionData>interaction.data;

        const playtestId = interactionData.options.find((o) => o.name === 'playtest_id')?.value;
        const newDate = interactionData.options.find((o) => o.name === 'date')?.value;
        const newTime = interactionData.options.find((o) => o.name === 'time')?.value;
        const playtestType = interactionData.options.find((o) => o.name === 'playtest_type')?.value;

        const request = await DatabaseWrapper.GetPlaytestRequest(interaction.guild_id, <Guid>playtestId);

        let changed = false;

        if (newDate) {
            request.requestDate = newDate;
            changed = true;
        }

        if (newTime) {
            request.requestTime = newTime;
            changed = true;
        }

        if (playtestType) {
            request.playtestType = playtestType;
            changed = true;
        }

        await DatabaseWrapper.DeletePlaytestRequest(interaction.guild_id, <Guid>playtestId);
        await DatabaseWrapper.CreateCS2PlaytestRequest(interaction.guild_id, request);

        return new CommandResult('Edited playtest request!', false, false);
    },
} as CommandDescription;
