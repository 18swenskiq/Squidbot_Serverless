import { type CommandDescription } from '../discord_api/command';
import { CommandResult } from '../discord_api/commandResult';
import { InteractionData, type Interaction } from '../discord_api/interaction';
import { GuildPermissions } from '../discord_api/permissions';
import { SlashCommandBuilder } from '../discord_api/slash_command_builder';

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
                    { name: '2v2', value: '2v2' },
                    { name: '5v5', value: '5v5' },
                    { name: '10v10', value: '10v10' },
                ])
        )
        .addStringOption((option) =>
            option.setName('workshop_id').setDescription('The id of the workshop map').setRequired(false)
        )
        .addStringOption((option) =>
            option.setName('author_id').setDescription('The id of the author').setRequired(false)
        )
        .setDefaultMemberPermissions([GuildPermissions.MANAGE_CHANNELS]),
    async execute(interaction: Interaction): Promise<CommandResult> {
        const interactionData = <InteractionData>interaction.data;

        const playtestId = interactionData.options.find((o) => o.name === 'playtest_id')?.value;
        const newDate = interactionData.options.find((o) => o.name === 'date')?.value;
        const newTime = interactionData.options.find((o) => o.name === 'time')?.value;
        const playtestType = interactionData.options.find((o) => o.name === 'playtest_type')?.value;
        const workshopId = interactionData.options.find((o) => o.name === 'workshop_id')?.value;
        const authorId = interactionData.options.find((o) => o.name === 'author_id')?.value;

        /*
        await new DatabaseQuery()
            .ModifyObject<DB_PlaytestRequest>(`${interaction.guild_id}/${playtestId}`)
            .ThrowIfNotExists()
            .SetPropertyIfValueNotUndefined('requestDate', newDate)
            .SetPropertyIfValueNotUndefined('requestTime', newTime)
            .SetPropertyIfValueNotUndefined('playtestType', playtestType)
            .SetPropertyIfValueNotUndefined('workshopId', workshopId)
            .SetPropertyIfValueNotUndefined('mainAuthor', authorId)
            .Execute(DB_PlaytestRequest);

            */
        return new CommandResult('Edited playtest request!', false, false);
    },
} as CommandDescription;
