import { type CommandDescription } from '../discord_api/command';
import { CommandResult } from '../discord_api/commandResult';
import { InteractionData, type Interaction } from '../discord_api/interaction';
import { GuildPermissions } from '../discord_api/permissions';
import { SlashCommandBuilder } from '../discord_api/slash_command_builder';
import { DatabaseWrapper } from '../util/databaseWrapper';
import { Guid } from '../util/guid';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('delete_playtest_request')
        .setDescription('Deletes a playtest request')
        .addStringOption((option) =>
            option.setName('playtest_id').setDescription('The Id of the playtest to delete').setRequired(true)
        )
        .setDefaultMemberPermissions([GuildPermissions.MANAGE_CHANNELS]),
    async execute(interaction: Interaction): Promise<CommandResult> {
        const interactionData = <InteractionData>interaction.data;
        const id = interactionData.options.find((o) => o.name === 'playtest_id')?.value;

        await DatabaseWrapper.DeletePlaytestRequest(interaction.guild_id, <Guid>id);
        return new CommandResult('Deleted the request!', false, false);
    },
} as CommandDescription;
