import { DiscordApiRoutes } from '../discord_api/apiRoutes';
import { type CommandDescription } from '../discord_api/command';
import { CommandResult } from '../discord_api/commandResult';
import { Embed } from '../discord_api/embed';
import { InteractionData, type Interaction } from '../discord_api/interaction';
import { GuildPermissions } from '../discord_api/permissions';
import { SlashCommandBuilder } from '../discord_api/slash_command_builder';
import { DatabaseWrapper } from '../util/databaseWrapper';
import { Guid } from '../util/guid';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('view_request_details')
        .setDescription('View the details of a playtest request')
        .addStringOption((option) =>
            option
                .setName('playtest_id')
                .setDescription('The Id of the playtest to view the details of')
                .setRequired(true)
        )
        .setDefaultMemberPermissions([GuildPermissions.MANAGE_CHANNELS]),
    async execute(interaction: Interaction): Promise<CommandResult> {
        const interactionData = <InteractionData>interaction.data;

        const id = interactionData.options.find((o) => o.name === 'playtest_id')?.value;
        const playtestRequest = await DatabaseWrapper.GetPlaytestRequest(interaction.guild_id, <Guid>id);

        const embed: Embed = {
            title: `${playtestRequest.mapName} by ${playtestRequest.mainAuthor}`,
            type: 'rich',
            color: 6730746,
            fields: [],
        };

        const cr = new CommandResult('cool', true, false);
        cr.embeds = [embed];
        return cr;

        /*
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
                value: `Id: ${value.Id}`,
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
        */
    },
} as CommandDescription;
