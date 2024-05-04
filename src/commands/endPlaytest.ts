import { PutObjectRequest } from '@aws-sdk/client-s3';
import { DiscordApiRoutes } from '../discord_api/apiRoutes';
import { type CommandDescription } from '../discord_api/command';
import { CommandResult } from '../discord_api/commandResult';
import { Embed } from '../discord_api/embed';
import { InteractionData, type Interaction } from '../discord_api/interaction';
import { GuildPermissions } from '../discord_api/permissions';
import { SlashCommandBuilder } from '../discord_api/slash_command_builder';
import { DatabaseWrapper } from '../util/databaseWrapper';
import { FTPUtil } from '../util/ftpUtil';
import { RconUtils } from '../util/rconUtil';
import { InvokeCommand, InvokeCommandInput, LambdaClient } from '@aws-sdk/client-lambda';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('end_playtest')
        .setDescription('Ends the currently active playtest')
        .setDefaultMemberPermissions([GuildPermissions.MANAGE_CHANNELS]),
    async execute(interaction: Interaction): Promise<CommandResult> {
        // Get guild settings and verify there is currently a playtest
        // const guildSettings = await DatabaseWrapper.GetGuildSettings(interaction.guild_id);

        /*
        const guildSettings = await new DatabaseQuery()
            .GetObject<DB_GuildSettings>(interaction.guild_id)
            .Execute(DB_GuildSettings);

        if (guildSettings === null) {
            throw new Error('Unable to find guildsettings in database');
        }

        if (guildSettings.activePlaytest == null) {
            return new CommandResult('There is currently no active playtest', false, false);
        }

        // Retrieve the active playtest object
        // const playtest = await DatabaseWrapper.GetScheduledPlaytest(interaction.guild_id, guildSettings.activePlaytest);
        const playtest = await new DatabaseQuery()
            .GetObject<DB_ScheduledPlaytest>(`${interaction.guild_id}/${guildSettings.activePlaytest}`)
            .Execute(DB_ScheduledPlaytest);

        if (playtest === null) {
            throw new Error('Unable to find guild active playtest in ScheduledPlaytests bucket');
        }

        // Retrieve the server object that the playtest is on
        const serverName = playtest.server;
        const servers = await DatabaseWrapper.GetGameServers(interaction.guild_id);
        const playtestRconServer = servers.find(
            (s) => s.ip === serverName.split(':')[0] && s.port === serverName.split(':')[1]
        );
        if (playtestRconServer == null) {
            return new CommandResult('Unable to find server associated with this playtest event', false, false);
        }

        // Stop recording
        await RconUtils.SendRconCommand(
            playtestRconServer.ip,
            playtestRconServer.port,
            playtestRconServer.rconPassword,
            'tv_stoprecord'
        );

        // FTP in and find the game folder
        const gameFolder = await FTPUtil.FindGameFolder(
            playtestRconServer.ftpHost,
            playtestRconServer.ftpPort,
            playtestRconServer.ftpUsername,
            playtestRconServer.ftpPassword
        );
        if (gameFolder === null) {
            return new CommandResult('Unable to FTP in and/or find game folder', false, false);
        }

        // Grab Postgame CFG from S3
        const cfgText = await DatabaseWrapper.GetPlaytestConfig('postgame');
        if (cfgText === null) {
            return new CommandResult('Could not find CFG in S3', false, false);
        }

        // Add postgame CFG to server
        const addCFGResult = await FTPUtil.AddCFGToFTP(
            playtestRconServer.ftpHost,
            playtestRconServer.ftpPort,
            playtestRconServer.ftpUsername,
            playtestRconServer.ftpPassword,
            `${gameFolder}/cfg`,
            'postgame.cfg',
            cfgText
        );
        if (addCFGResult === false) {
            return new CommandResult('Unable to add CFG over FTP', false, false);
        }

        // Exec postgame
        await RconUtils.SendRconCommand(
            playtestRconServer.ip,
            playtestRconServer.port,
            playtestRconServer.rconPassword,
            'exec postgame'
        );

        // Set active playtest to null
        // await DatabaseWrapper.SetGuildActivePlaytest(interaction.guild_id, null);
        await new DatabaseQuery()
            .ModifyObject<DB_GuildSettings>(interaction.guild_id)
            .SetProperty('activePlaytest', null)
            .Execute(DB_GuildSettings);

        const user = await DiscordApiRoutes.getUser(playtest.mainAuthor);

        // Send message in playtest channel that playtest is ending
        const embed: Embed = {
            title: `Ending playtest of ${playtest.mapName} by ${user.username}`,
            type: 'rich',
            description: `Demo will be retrieved from the server and posted in the announcements channel shortly`,
            footer: { text: `Playtest Id: ${playtest.id}` },
        };
        await DiscordApiRoutes.createNewMessage(guildSettings.playtesting.cs2.playtestChannel, '', [embed]);

        // Download demo locally
        const demoPath = await FTPUtil.GetDemo(
            playtestRconServer.ftpHost,
            playtestRconServer.ftpPort,
            playtestRconServer.ftpUsername,
            playtestRconServer.ftpPassword,
            gameFolder,
            playtest.id
        );
        if (demoPath === null) {
            return new CommandResult('Unable to download demo from server to lambda', false, false);
        }

        // Upload demo to S3
        const s3ObjectPath = await DatabaseWrapper.UploadFileToS3(demoPath, `Demos/${playtest.id}.dem`);

        // Post link to object in S3 in announcement channel, mention creator
        await DiscordApiRoutes.createNewMessage(
            guildSettings.playtesting.cs2.announceChannel,
            `Demo for ${playtest.mapName} by <@${playtest.mainAuthor}>\n${s3ObjectPath}`
        );

        let lambdaPlaytestType: number;
        switch (playtest.playtestType) {
            case '2v2':
                lambdaPlaytestType = 0;
                break;
            case '5v5':
                lambdaPlaytestType = 1;
                break;
            case '10v10':
                lambdaPlaytestType = 2;
                break;
            default:
                throw new Error('Unexpected playtest type');
        }

        // Call demo parsing lambda
        const lambdaParameters = {
            DemoName: playtest.id,
            GuildId: interaction.guild_id,
            DemoContext: 0,
            PlaytestType: lambdaPlaytestType,
        };

        const lambdaParams: InvokeCommandInput = {
            FunctionName: 'squidbot_demo_parser',
            InvocationType: 'RequestResponse',
            LogType: 'Tail',
            Payload: JSON.stringify(lambdaParameters),
        };

        const client = new LambdaClient();
        const fetchCommand = new InvokeCommand(lambdaParams);

        const response = await client.send(fetchCommand);
        console.log('lambda response:');
        console.log(response);

        // Move "ScheduledPlaytest" event to a bucket for completed playtests
        try {
            await DatabaseWrapper.MoveScheduledPlaytestToCompleted(interaction.guild_id, playtest.id);
        } catch (err: any) {
            return new CommandResult(
                "Playtest successfully ended. All tasks completed except moving ScheduledPlaytests S3 object to the CompletedPlaytests folder (This shouldn't affect anything)",
                false,
                false
            );
        }

        */
        // Done :)
        return new CommandResult('Playtest successfully ended and all steps completed successfully', false, false);
    },
} as CommandDescription;
