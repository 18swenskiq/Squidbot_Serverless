import { getTimeZones } from '@vvo/tzdb';
import { type CommandDescription } from '../discord_api/command';
import { type Interaction } from '../discord_api/interaction';
import { MiscEndpoints } from '../discord_api/miscEndpoints';
import { SlashCommandBuilder } from '../discord_api/slash_command_builder';
import { DatabaseWrapper } from '../util/databaseWrapper';
import { CommandResult } from '../discord_api/commandResult';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('times')
        .setDescription('Gets the current times for all registered users currently in the guild'),
    async execute(interaction: Interaction): Promise<CommandResult> {
        const result = await MiscEndpoints.GetGuildMembers(interaction.guild_id);

        const userIds: string[] = result.map((r) => (r.user !== null ? r.user.id : ''));
        const response = await DatabaseWrapper.GetUserSettings(userIds);

        const zones = getTimeZones({ includeUtc: true });

        const dict: Record<string, string[]> = {};

        const now = Date.now();
        for (const userId in response) {
            const settings = response[userId];

            const timeZoneCode: string = settings.timeZoneName;
            const username = result.find((e) => e.user?.id === userId)?.user?.username;

            if (username === undefined) {
                throw Error();
            }

            const currentTimeZone = zones.find((z) => z.name === timeZoneCode);

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
        }

        let retString = 'Use `/set_time` to add your time to the list!\n```yml\n';

        const coolSortingList = Object.entries(dict);

        coolSortingList.sort(function (a, b) {
            const aHours = Number(a[0].split(':')[0]);
            const bHours = Number(b[0].split(':')[0]);
            return aHours > bHours ? 1 : -1;
        });

        for (const kvp of coolSortingList) {
            const test = kvp[1].join(', ');
            const hrs = kvp[0].split(':')[0].padStart(2, '0');
            const mns = kvp[0].split(':')[1].padStart(2, '0');
            retString += `${hrs}:${mns} - (${test})\n`;
        }

        retString += '```';
        return new CommandResult(retString, false, false);
    },
} as CommandDescription;
