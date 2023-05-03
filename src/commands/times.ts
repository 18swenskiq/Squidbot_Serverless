import { getTimeZones } from '@vvo/tzdb'
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

    const zones = getTimeZones({ includeUtc: true });

    const dict: Record<string, string[]> = {};

    const now = Date.now();
    response.SquidBot.forEach((r: any) => {
      const id: string = r.squidBot;
      const timeZoneCode: string = r.userTimeZone;
      const username = result.find(e => e.user?.id === id)?.user?.username;

      if (username === undefined) {
        throw Error();
      }

      const currentTimeZone = zones.find(z => z.name === timeZoneCode);

      if (currentTimeZone === undefined) {
        throw Error();
      }

      const currentOffset = currentTimeZone?.currentTimeOffsetInMinutes;

      const offsetMs = currentOffset * 60000;
      const resultTz = new Date(now + offsetMs);

      const timeString = `${resultTz.getHours()}:${resultTz.getMinutes()}`;

      if (dict[timeString] === undefined) {
        dict[timeString] = [username];
      } else {
        dict[timeString].push(username);
      }
    });

    let retString = '```py\n';

    Object.keys(dict).sort()

    for (const [timeStr, userList] of Object.entries(dict)) {
      const test = userList.join(', ');
      retString += `${timeStr} - (${test})\n`;
    }

    retString += '```';
    return retString;
  }
} as CommandDescription
