import { DiscordApiRoutes } from '../discord_api/apiRoutes';
import { CommandDescription } from '../discord_api/command';
import { CommandResult } from '../discord_api/commandResult';
import { Interaction } from '../discord_api/interaction';
import { RoleSelectComponent, SelectOption } from '../discord_api/messageComponent';
import { SlashCommandBuilder } from '../discord_api/slash_command_builder';
import { DatabaseWrapper } from '../util/databaseWrapper';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('roleme')
    .setDescription('Assign roles to yourself!'),
  async execute (interaction: Interaction): Promise<CommandResult> {
    const assignableRoles = await DatabaseWrapper.GetGuildRolesAssignable(interaction.guild_id);

    // We need to get the server roles for the names for the dropdown
    const allRoles = await DiscordApiRoutes.getGuildRoles(interaction.guild_id);

    const cr = new CommandResult('Select your roles!', true);
    const roleDropdownComponent = new RoleSelectComponent();
    const interactionGuid = (<any>crypto).randomUUID(); // i hate this workaround

    roleDropdownComponent.placeholder = 'Select your roles!';
    roleDropdownComponent.custom_id = interactionGuid;
    roleDropdownComponent.options = assignableRoles.map(r => {
      const label = allRoles.find(a => a.id === r)?.name;
      const value = r;
      const isDefault = interaction.member.roles.includes(r);

      return <SelectOption>{ label, value, default: isDefault };
    })

    // Store this interaction in the db
    // Actually let's see what happens

    return cr;
  }
} as CommandDescription
