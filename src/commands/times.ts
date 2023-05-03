import { type CommandDescription } from '../discord_api/command'
import { type Interaction } from '../discord_api/interaction'
import { MiscEndpoints } from '../discord_api/miscEndpoints'
import { SlashCommandBuilder } from '../discord_api/slash_command_builder'
import { Database } from '../util/database'

module.exports = {
  data: new SlashCommandBuilder()
    .setName('times')
    .setDescription('Gets the current times for all registered users currently in the guild'),
  async execute (interaction: Interaction): Promise<string> {
    const result = await MiscEndpoints.GetGuildMembers(interaction.guild_id);

    const userIds: string[] = result.map(r => r.user !== null ? r.user.id : '');
    const response = await Database.BatchGet(userIds);

    console.log('calling from times:');
    console.log(response);

    // let retString = '';

    // response.forEach(r => {
    //  retString += (r.nick !== null ? r.nick : 'unresolvable nickname');
    // });

    return 'testing but more';
  }
} as CommandDescription
