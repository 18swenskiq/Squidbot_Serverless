import { type CommandDescription } from '../discord_api/command';
import { CommandResult } from '../discord_api/commandResult';
import { InteractionData, type Interaction } from '../discord_api/interaction';
import { GuildPermissions } from '../discord_api/permissions';
import { SlashCommandBuilder } from '../discord_api/slash_command_builder';
import { DatabaseWrapper } from '../util/databaseWrapper';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('toggle_role_assignable')
        .setDescription('Toggles a role so that a user can assign it to themself')
        .addRoleOption((input) =>
            input.setName('role').setDescription('The role to toggle as assignable').setRequired(true)
        )
        .setDefaultMemberPermissions([GuildPermissions.MANAGE_ROLES]),
    async execute(interaction: Interaction): Promise<CommandResult> {
        const interactionData = <InteractionData>interaction.data;
        const roleOpt = interactionData.options[0];
        const result = await DatabaseWrapper.ToggleGuildRoleAssignable(interaction.guild_id, roleOpt.value);
        return new CommandResult(result, false, false);
    },
} as CommandDescription;
