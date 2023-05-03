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

    let retString = '```py\n';

    response.SquidBot.forEach((r: any) => {
      const id: string = r.squidBot;
      const timeZoneCode: string = r.userTimeZone;
      const nick = result.find(e => e.user?.id === id)?.user?.username;
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      retString += `${nick}: ${timeZoneCode}\n`;
    });

    retString += '```';
    return retString;
  }
} as CommandDescription
