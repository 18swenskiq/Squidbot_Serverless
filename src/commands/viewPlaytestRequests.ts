import { DiscordApiRoutes } from '../discord_api/apiRoutes';
import { type CommandDescription } from '../discord_api/command';
import { CommandResult } from '../discord_api/commandResult';
import { Embed } from '../discord_api/embed';
import { InteractionData, type Interaction } from '../discord_api/interaction';
import { SlashCommandBuilder } from '../discord_api/slash_command_builder';
import { DatabaseWrapper } from '../util/databaseWrapper';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('view_playtest_requests')
        .setDescription('View the current outstanding playtest requests')
        .addStringOption((option) =>
            option
                .setName('game')
                .setDescription('The game to view playtest requests for')
                .setRequired(true)
                .addChoices([{ name: 'Counter-Strike 2', value: 'cs2' }])
        ),
    async execute(interaction: Interaction): Promise<CommandResult> {
        const interactionData = <InteractionData>interaction.data;

        const game = interactionData.options.find((o) => o.name === 'game')?.value;
        const playtestRequests = await DatabaseWrapper.GetPlaytestRequests(interaction.guild_id);
        console.log('playtest requests');
        console.log(playtestRequests);

        const embed: Embed = {
            title: 'Playtest Requests',
            description: `Game: ${interactionData.options.find((o) => o.name === 'game')?.value}`,
            type: 'rich',
            color: 6730746,
            fields: [],
        };

        for (const key in playtestRequests) {
            console.log('key');
            console.log(key);

            const value = playtestRequests[key];

            console.log('value');
            console.log(value);

            if (value.game !== game) {
                continue;
            }

            const user = await DiscordApiRoutes.getUser(value.mainAuthor);

            const mmddyyyy = value.requestDate.split('/');
            const hhmm = value.requestTime.split(':');
            const composedDate = new Date(
                Number(mmddyyyy[2]),
                Number(mmddyyyy[0]) - 1,
                Number(mmddyyyy[1]),
                Number(hhmm[0]),
                Number(hhmm[1])
            );

            const easternOffset = getOffset('US/Eastern');
            composedDate.setMinutes(composedDate.getMinutes() + easternOffset);

            embed.fields?.push({
                //name: `${value.mapName} by ${user.username} - (${value.requestDate} ${value.requestTime})`,
                name: `${value.mapName} by ${user.username} - (<t:${composedDate.getTime() / 1000}:f>)`,
                value: `${value.Id}`,
                inline: true,
            });
        }

        if (embed.fields!.length > 0) {
            const cr = new CommandResult('Use <other command> to schedule', true, false);
            cr.embeds = [embed];
            return cr;
        } else {
            return new CommandResult('no playtest requests :(', false, false);
        }
    },
} as CommandDescription;

const getOffset = (timeZone: any) => {
    const timeZoneFormat = Intl.DateTimeFormat('ia', {
        timeZoneName: 'short',
        timeZone,
    });
    const timeZoneParts = timeZoneFormat.formatToParts();
    const timeZoneName = timeZoneParts.find((i) => i.type === 'timeZoneName')!.value;
    const offset = timeZoneName.slice(3);
    if (!offset) return 0;

    const matchData = offset.match(/([+-])(\d+)(?::(\d+))?/);
    if (!matchData) throw `cannot parse timezone name: ${timeZoneName}`;

    const [, sign, hour, minute] = matchData;
    let result = parseInt(hour) * 60;
    if (sign === '+') result *= -1;
    if (minute) result += parseInt(minute);

    return result;
};
