import { DiscordApiRoutes } from '../discord_api/apiRoutes';
import { CommandDescription } from '../discord_api/command';
import { CommandResult } from '../discord_api/commandResult';
import { Interaction } from '../discord_api/interaction';
import { SelectOption, StringSelectComponent } from '../discord_api/messageComponent';
import { SlashCommandBuilder } from '../discord_api/slash_command_builder';
import { DatabaseWrapper } from '../util/databaseWrapper';
import { GenerateGuid, Guid } from '../util/guid';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('roleme')
    .setDescription('Assign roles to yourself!'),
  async execute (interaction: Interaction): Promise<CommandResult> {
    const assignableRoles = await DatabaseWrapper.GetGuildRolesAssignable(interaction.guild_id);

    // We need to get the server roles for the names for the dropdown
    const allRoles = await DiscordApiRoutes.getGuildRoles(interaction.guild_id);

    const cr = new CommandResult('Select your roles!', true, true);
    const roleDropdownComponent = new StringSelectComponent();

    const interactionGuid: Guid = GenerateGuid();

    roleDropdownComponent.min_values = 1;
    roleDropdownComponent.max_values = assignableRoles.length;
    roleDropdownComponent.placeholder = 'Select your roles!';
    roleDropdownComponent.custom_id = interactionGuid;
    roleDropdownComponent.options = assignableRoles.map(r => {
      const role = allRoles.find(a => a.id === r);
      const label = role?.name;
      const value = role?.id;
      const isDefault = interaction.member.roles.includes(r);

      return <SelectOption>{ label, value, default: isDefault };
    })

    const componentWrapper: any = { type: 1, components: [] };
    componentWrapper.components.push(<any>roleDropdownComponent);

    cr.components = [];
    cr.components.push(componentWrapper);

    await DatabaseWrapper.SetInteractionHandler(interaction.member.user.id, interaction.guild_id, interactionGuid, 'AssignRoles');

    return cr;
  }
} as CommandDescription
