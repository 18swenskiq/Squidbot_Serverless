import { DiscordApiRoutes } from '../discord_api/apiRoutes';
import { type CommandDescription } from '../discord_api/command';
import { CommandResult } from '../discord_api/commandResult';
import { GuildEventStatus } from '../discord_api/guildEventStatus';
import { InteractionData, type Interaction } from '../discord_api/interaction';
import { GuildPermissions } from '../discord_api/permissions';
import { SlashCommandBuilder } from '../discord_api/slash_command_builder';
import { DatabaseWrapper } from '../util/databaseWrapper';
import { Guid } from '../util/guid';
import { RconUtils } from '../util/rconUtil';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('start_playtest')
        .setDescription('Starts the next playtest or the playtest by provided Id')
        .addStringOption((option) =>
            option
                .setName('playtest_id')
                .setDescription('The id of the playtest to start. Optional, if not provided the next event will start')
                .setRequired(false)
        )
        .setDefaultMemberPermissions([GuildPermissions.MANAGE_CHANNELS]),
    async execute(interaction: Interaction): Promise<CommandResult> {
        const interactionData = <InteractionData>interaction.data;
        let playtestId = interactionData.options.find((o) => o.name === 'playtest_id')?.value;

        // Check if guild has an active playtest
        const settings = await DatabaseWrapper.GetGuildSettings(interaction.guild_id);
        if (settings.activePlaytest != null) {
            return new CommandResult('There is currently an active playtest.', false, false);
        }

        const databaseScheduledEventList = await DatabaseWrapper.ListScheduledPlaytests(interaction.guild_id);
        const databaseScheduledEventIds = databaseScheduledEventList.map((d) => d.split('.')[0]);

        // If no parameter was provided, get the current/next event from the Guild
        if (playtestId == null) {
            const events = await DiscordApiRoutes.listGuildEvents(interaction.guild_id);
            let eventDates = events.map((e) => ({
                id: e.id,
                startDate: new Date(e.scheduled_start_time),
            }));

            eventDates.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

            // Iterate through the events and find the first one that matches a playtest event
            for (let i = 0; i < eventDates.length; i++) {
                const event = events.find((e) => e.id === eventDates[i].id);
                if (event!.status === GuildEventStatus.COMPLETED || event!.status === GuildEventStatus.CANCELED) {
                    continue;
                }

                // Check to see if a key in databaseScheduledEventList is contained in the description of this event
                if (event?.description == undefined) {
                    continue;
                }

                for (let j = 0; j < databaseScheduledEventIds.length; j++) {
                    const id = databaseScheduledEventIds[j];
                    if (event.description.includes(id)) {
                        // Match found
                        playtestId = id;
                        break;
                    }
                }

                if (playtestId != undefined) {
                    break;
                }
            }

            // If we get through the for loop and the playtest id is null, we are unable to find the event.
            if (playtestId == undefined) {
                return new CommandResult('Unable to find scheduled playtest', false, false);
            }
        }
        // Otherwise verify that the provided playtest id is valid
        else {
            if (!databaseScheduledEventIds.includes(playtestId)) {
                return new CommandResult('Could not find defined playtest event', false, false);
            }
        }

        const playtest = await DatabaseWrapper.GetScheduledPlaytest(interaction.guild_id, <Guid>playtestId);
        const serverName = playtest.server;

        const servers = await DatabaseWrapper.GetGameServers(interaction.guild_id);
        const server = servers.find((s) => s.ip === serverName.split(':')[0] && s.port === serverName.split(':')[1]);

        if (server === undefined) {
            return new CommandResult('Could not find rcon server attached to playtest event.', false, false);
        }

        // TODO: Validate that server has configs and if not, add them via FTP
        // :(

        let execName;
        switch (playtest.playtestType) {
            case '2v2':
                execName = 'se_2v2';
                break;
            case '5v5':
                execName = 'se_5v5';
                break;
            case '10v10':
                execName = 'se_10v10';
                break;
            default:
                return new CommandResult('Unexpected playtest type', false, false);
        }

        // Send start exec
        await RconUtils.SendRconCommand(server.ip, server.port, server.rconPassword, `exec ${execName}`);
        // Send demo record

        // Set active playtest

        return new CommandResult('nothing', false, false);
    },
} as CommandDescription;