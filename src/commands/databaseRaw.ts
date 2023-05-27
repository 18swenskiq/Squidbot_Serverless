import { type CommandDescription } from '../discord_api/command'
import { type Interaction } from '../discord_api/interaction'
import { SlashCommandBuilder } from '../discord_api/slash_command_builder'
import { Database2 } from '../util/database2';

const userList = ['66318815247466496'];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('test')
    .setDescription('test description')
    .setAllowedUsersOnly(userList),
  async execute (interaction: Interaction): Promise<string> {
    if (!userList.includes(interaction.member.user.id)) {
      return 'You do not have permissions to run this command. Requires: [BEING SQUIDSKI]';
    }

    const result = await Database2.Test();
    return result;
  }
} as CommandDescription;
