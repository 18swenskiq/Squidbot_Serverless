import { DiscordApiRoutes } from '../discord_api/apiRoutes';
import { type CommandDescription } from '../discord_api/command';
import { CommandResult } from '../discord_api/commandResult';
import { Embed } from '../discord_api/embed';
import { GuildEventStatus } from '../discord_api/guildEventStatus';
import { InteractionData, type Interaction } from '../discord_api/interaction';
import { GuildPermissions } from '../discord_api/permissions';
import { SlashCommandBuilder } from '../discord_api/slash_command_builder';
import { DatabaseWrapper } from '../util/databaseWrapper';
import { FTPUtil } from '../util/ftpUtil';
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
        let playtestId = interactionData.options
            ? interactionData.options.find((o) => o.name === 'playtest_id')?.value
            : undefined;

        // Check if guild has an active playtest
        const settings = await DatabaseWrapper.GetGuildSettings(interaction.guild_id);
        if (settings.activePlaytest != null) {
            return new CommandResult('There is currently an active playtest.', false, false);
        }

        const databaseScheduledEventList = await DatabaseWrapper.ListScheduledPlaytests(interaction.guild_id);
        const databaseScheduledEventIds = databaseScheduledEventList
            .map((d) => d.split('/'))
            .map((e) => e[2])
            .map((f) => f.split('.')[0]);

        console.log('Database scheduled event list:');
        console.log(databaseScheduledEventList);

        // If no parameter was provided, get the current/next event from the Guild
        if (playtestId == undefined) {
            const events = await DiscordApiRoutes.listGuildEvents(interaction.guild_id);
            let eventDates = events.map((e) => ({
                id: e.id,
                startDate: new Date(e.scheduled_start_time),
            }));

            eventDates.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

            // Iterate through the events and find the first one that matches a playtest event
            console.log('Looping through events');
            for (let i = 0; i < eventDates.length; i++) {
                const event = events.find((e) => e.id === eventDates[i].id);
                console.log(event);
                if (event!.status === GuildEventStatus.COMPLETED || event!.status === GuildEventStatus.CANCELED) {
                    continue;
                }

                // Check to see if a key in databaseScheduledEventList is contained in the description of this event
                if (event?.description == undefined) {
                    continue;
                }

                console.log('Looping through ids from database');
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

        // Find the server game folder
        const serverGameFolder = await FTPUtil.FindGameFolder(
            server.ftpHost,
            server.ftpPort,
            server.ftpUsername,
            server.ftpPassword
        );
        if (serverGameFolder == null) {
            return new CommandResult('Unable to FTP into server and/or find game folder', false, false);
        }

        // Grab the exec we want from S3
        const cfgText = await DatabaseWrapper.GetPlaytestConfig(execName);
        if (cfgText == null) {
            return new CommandResult(`Unable to grab config \`${execName}.cfg\` from S3`, false, false);
        }

        // Upload the exec to FTP
        const addCFGResult = await FTPUtil.AddCFGToFTP(
            server.ftpHost,
            server.ftpPort,
            server.ftpUsername,
            server.ftpPassword,
            `${serverGameFolder}/cfg`,
            `${execName}.cfg`,
            cfgText
        );
        if (addCFGResult === false) {
            return new CommandResult('Unable to add CFG to FTP server', false, false);
        }

        // Send start exec
        await RconUtils.SendRconCommand(server.ip, server.port, server.rconPassword, `exec ${execName}`);

        // Send demo record
        await RconUtils.SendRconCommand(server.ip, server.port, server.rconPassword, `tv_record ${playtest.Id}`);

        // Set active playtest
        await DatabaseWrapper.SetGuildActivePlaytest(interaction.guild_id, playtest.Id);

        // Send "Starting playtest" message to level testing channel
        const playtestChannel = settings.playtesting.cs2.playtestChannel;
        const embed: Embed = {
            title: `Starting Playtest of ${playtest.mapName} by <@${playtest.mainAuthor}>`,
            type: 'rich',
            footer: { text: `Playtest Id: ${playtest.Id}` },
        };
        await DiscordApiRoutes.createNewMessage(playtestChannel, '', [embed]);

        return new CommandResult('Starting playtest', false, false);
    },
} as CommandDescription;
