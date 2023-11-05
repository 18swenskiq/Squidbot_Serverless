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

            embed.fields?.push({
                name: `${value.mapName} by ${user.username} - (${value.requestDate} ${value.requestTime})`,
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
