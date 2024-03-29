import { DB_ScheduledPlaytest } from '../database_models/scheduledPlaytest';
import { DiscordApiRoutes } from '../discord_api/apiRoutes';
import { type CommandDescription } from '../discord_api/command';
import { CommandResult } from '../discord_api/commandResult';
import { InteractionData, type Interaction } from '../discord_api/interaction';
import { GuildPermissions } from '../discord_api/permissions';
import { SlashCommandBuilder } from '../discord_api/slash_command_builder';
import { DatabaseWrapper } from '../util/databaseWrapper';
import { DatabaseQuery } from '../util/database_query/databaseQuery';
import { Guid } from '../util/guid';
import { TimeUtils } from '../util/timeUtils';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('modify_playtest')
        .setDescription('Modify the details of a scheduled playtest. All fields other than Id are optional')
        .addStringOption((option) =>
            option.setName('playtest_id').setDescription('The id of the playtest to modify').setRequired(true)
        )
        .addStringOption((option) =>
            option.setName('date').setDescription('The date of the playtest. Format: MM/DD/YYYY').setRequired(false)
        )
        .addStringOption((option) =>
            option
                .setName('time')
                .setDescription('The time of the playtest. Format: HH:MM (in US Eastern Time)')
                .setRequired(false)
        )
        .addStringOption((option) =>
            option
                .setName('playtest_type')
                .setDescription('The type of the playtest')
                .setRequired(false)
                .addChoices([
                    { name: '5v5', value: '5v5' },
                    { name: '10v10', value: '10v10' },
                ])
        )
        .addStringOption((option) =>
            option.setName('workshop_id').setDescription('The workshop id of the submission').setRequired(false)
        )
        .addStringOption((option) =>
            option
                .setName('moderator')
                .setDescription('Set the id of the moderator of the submission')
                .setRequired(false)
        )
        .addStringOption((option) =>
            option.setName('server').setDescription('The playtest server (with port)').setRequired(false)
        )
        .setDefaultMemberPermissions([GuildPermissions.MANAGE_CHANNELS]),
    async execute(interaction: Interaction): Promise<CommandResult> {
        const interactionData = <InteractionData>interaction.data;

        const playtestId = interactionData.options.find((o) => o.name === 'playtest_id')?.value;
        const newDate = interactionData.options.find((o) => o.name === 'date')?.value;
        const newTime = interactionData.options.find((o) => o.name === 'time')?.value;
        const playtestType = interactionData.options.find((o) => o.name === 'playtest_type')?.value;
        const workshopId = interactionData.options.find((o) => o.name === 'workshop_id')?.value;
        const moderator = interactionData.options.find((o) => o.name === 'moderator')?.value;
        const server = interactionData.options.find((o) => o.name === 'server')?.value;

        // const playtest = await DatabaseWrapper.GetScheduledPlaytest(interaction.guild_id, <Guid>playtestId);
        const playtest = await new DatabaseQuery()
            .GetObject<DB_ScheduledPlaytest>(`${interaction.guild_id}/${playtestId}`)
            .Execute(DB_ScheduledPlaytest);
        if (playtest === null) {
            throw new Error('Unable to find scheduled playtest');
        }

        let updatePlaytestDate: Date = playtest.playtestTime;
        if (newDate || newTime) {
            const playtestDate = newDate
                ? newDate
                : `${playtest.playtestTime.getMonth()}/${playtest.playtestTime.getDate()}/${playtest.playtestTime.getFullYear()}`;
            const playtestTime = newTime
                ? newTime
                : `${playtest.playtestTime.getHours()}:${playtest.playtestTime.getMinutes()}`;

            const date = TimeUtils.ComposeDateFromStringComponents(playtestDate, playtestTime);

            const easternOffset = TimeUtils.GetOffset('US/Eastern');
            date.setMinutes(date.getMinutes() + easternOffset);
            // playtest.playtestTime = date;
            // changed = true;
            updatePlaytestDate = date;
        }

        /*
        if (playtestType) {
            playtest.playtestType = playtestType;
            changed = true;
        }

        if (workshopId) {
            playtest.workshopId = workshopId;
            changed = true;
        }

        if (moderator) {
            playtest.moderator = moderator;
            changed = true;
        }
        */

        let updateServer = undefined;
        if (server) {
            const servers = await DatabaseWrapper.GetGameServers(interaction.guild_id);
            const inputArray = server.split(':');
            const matchServer = servers.find((s) => s.ip === inputArray[0] && s.port === inputArray[1]);
            if (matchServer === undefined) {
                return new CommandResult('Invalid playtest server, no changes were made', false, false);
            }
            //playtest.server = `${matchServer.ip}:${matchServer.port}`;
            updateServer = `${matchServer.ip}:${matchServer.port}`;
            // changed = true;
        }

        await new DatabaseQuery()
            .ModifyObject<DB_ScheduledPlaytest>(`${interaction.guild_id}/${playtestId}`)
            .SetPropertyIfValueNotUndefined('playtestType', playtestType)
            .SetPropertyIfValueNotUndefined('workshopId', workshopId)
            .SetPropertyIfValueNotUndefined('moderator', moderator)
            .SetPropertyIfValueNotUndefined('server', updateServer)
            .SetProperty('playtestTime', updatePlaytestDate)
            .Execute(DB_ScheduledPlaytest);

        // if (changed) {
        // Edit playtest in database
        //await DatabaseWrapper.DeleteScheduledPlaytest(interaction.guild_id, <Guid>playtest.Id);
        // await DatabaseWrapper.CreateScheduledPlaytest(interaction.guild_id, playtest);

        // Edit calendar item
        const moderatorUser = await DiscordApiRoutes.getUser(playtest.moderator);

        const description = [
            `Game: ${playtest.game}`,
            `Server: ${playtest.server}`,
            `Playtest Type: ${playtest.playtestType}`,
            `Map Type: ${playtest.mapType}`,
            `Workshop Link: https://steamcommunity.com/sharedfiles/filedetails/?id=${playtest.workshopId}`,
            `Other Authors: ${playtest.otherAuthors.join(', ')}`,
            `Moderator: ${moderatorUser.username}`,
            `Playtest Id: ${playtestId}`,
        ];

        if (newDate || newTime) {
            const startTimeString = playtest.playtestTime.toISOString();
            const endTimeDate = TimeUtils.GetNewDateFromAddMinutes(playtest.playtestTime, 90);

            await DiscordApiRoutes.modifyGuildEvent(
                interaction.guild_id,
                playtest.eventId,
                description.join('\n'),
                startTimeString,
                endTimeDate.toISOString()
            );
        } else {
            await DiscordApiRoutes.modifyGuildEvent(interaction.guild_id, playtest.eventId, description.join('\n'));
        }
        return new CommandResult('Updated playtest event', false, false);
        // } else {
        //    return new CommandResult('No changes were detected', false, false);
        //}
    },
} as CommandDescription;
