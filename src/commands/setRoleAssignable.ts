import { type CommandDescription } from '../discord_api/command'
import { type Interaction } from '../discord_api/interaction'
import { GuildPermissions } from '../discord_api/permissions';
import { SlashCommandBuilder } from '../discord_api/slash_command_builder'

module.exports = {
  data: new SlashCommandBuilder()
    .setName('set_role_assignable')
    .setDescription('Sets a role so that a user can assign it to themself')
    .setDefaultMemberPermissions([GuildPermissions.MANAGE_ROLES]),
  async execute (interaction: Interaction): Promise<string> {
    return 'testing callability';
  }
} as CommandDescription;
