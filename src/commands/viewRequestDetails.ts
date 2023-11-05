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

        const mainAuthorName = (await DiscordApiRoutes.getUser(playtestRequest.mainAuthor)).username;
        const authors: string[] = [mainAuthorName];

        if (playtestRequest.otherAuthors && playtestRequest.otherAuthors.length > 0) {
            for (let i = 0; i < playtestRequest.otherAuthors.length, i++; ) {
                const authorId = playtestRequest.otherAuthors[i];
                const newAuthor = (await DiscordApiRoutes.getUser(authorId)).username;
                authors.push(newAuthor);
            }
        }

        const coolTimeString = (playtestRequest.dateSubmitted as any)['$date'];
        const newDate = new Date(coolTimeString);
        console.log(newDate);

        const embed: Embed = {
            title: `${playtestRequest.mapName} by ${mainAuthorName}`,
            description: playtestRequest.Id,
            thumbnail: { url: playtestRequest.thumbnailImage },
            url: `https://steamcommunity.com/sharedfiles/filedetails/?id=${playtestRequest.workshopId}`,
            type: 'rich',
            color: 6730746,
            fields: [
                {
                    name: `Test Date`,
                    value: `${newDate.getMonth() + 1}/${newDate.getDate()}/${newDate.getFullYear()} ${
                        playtestRequest.requestTime
                    }`,
                    inline: false,
                },
                {
                    name: 'Game',
                    value: playtestRequest.game,
                    inline: false,
                },
                {
                    name: 'Map Name',
                    value: playtestRequest.mapName,
                    inline: false,
                },
                {
                    name: 'Authors',
                    value: authors.join(', '),
                    inline: false,
                },
                {
                    name: 'Type',
                    value: `${playtestRequest.mapType} - ${playtestRequest.playtestType}`,
                    inline: false,
                },
            ],
        };

        const cr = new CommandResult('Use <Other command for something>', true, false);
        cr.embeds = [embed];
        return cr;
    },
} as CommandDescription;
