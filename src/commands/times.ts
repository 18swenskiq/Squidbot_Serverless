// import { getTimeZones } from '@vvo/tzdb'
import { type CommandDescription } from '../discord_api/command'
import { type Interaction } from '../discord_api/interaction'
// import { MiscEndpoints } from '../discord_api/miscEndpoints'
import { SlashCommandBuilder } from '../discord_api/slash_command_builder'
// import { Database } from '../util/database'

module.exports = {
  data: new SlashCommandBuilder()
    .setName('times')
    .setDescription('Gets the current times for all registered users currently in the guild'),
  async execute (interaction: Interaction): Promise<string> {
    /*
    const totalStart = Date.now();
    const result = await MiscEndpoints.GetGuildMembers(interaction.guild_id);
    console.log(`Getting guild members took - ${Date.now() - totalStart}ms`);

    const userIds: string[] = result.map(r => r.user !== null ? r.user.id : '');
    const databaseCallStart = Date.now();
    const response = await Database.GetUserInformation(userIds);
    console.log(`Getting information from database took - ${Date.now() - databaseCallStart}ms`);

    const getTzStart = Date.now();
    const zones = getTimeZones({ includeUtc: true });
    console.log(`Getting time zones took - ${Date.now() - getTzStart}ms`);

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

    let retString = 'Use `/set_time` to add your time to the list!\n```yml\n';

    const coolSortingList = Object.entries(dict);

    coolSortingList.sort(function (a, b) {
      const aHours = Number(a[0].split(':')[0]);
      const bHours = Number(b[0].split(':')[0]);
      return aHours > bHours ? 1 : -1;
    })

    for (const kvp of coolSortingList) {
      const test = kvp[1].join(', ');
      const hrs = kvp[0].split(':')[0].padStart(2, '0');
      const mns = kvp[0].split(':')[1].padStart(2, '0');
      retString += `${hrs}:${mns} - (${test})\n`;
    }

    retString += '```';
    console.log(`Building response content string took - ${Date.now() - now}ms`);
    console.log(`Total time: ${Date.now() - totalStart}ms`);
    return retString;
    */
    return 'temporarily broken!';
  }
} as CommandDescription
