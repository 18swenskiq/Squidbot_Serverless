import { Services } from '../database_services/services';
import { type CommandDescription } from '../discord_api/command';
import { CommandResult } from '../discord_api/commandResult';
import { InteractionData, type Interaction } from '../discord_api/interaction';
import { GuildPermissions } from '../discord_api/permissions';
import { SlashCommandBuilder } from '../discord_api/slash_command_builder';
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

        console.log(`deleting ${id}`);
        const result = await Services.PlaytestRequestsSvc.DeleteById(<Guid>id);

        console.log(result);

        return new CommandResult('Deleted the request!', false, false);
    },
} as CommandDescription;
