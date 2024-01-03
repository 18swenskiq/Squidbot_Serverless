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
import { StaticDeclarations } from '../util/staticDeclarations';
import { InvokeCommand, InvokeCommandInput, LambdaClient } from '@aws-sdk/client-lambda';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('end_playtest')
        .setDescription('Ends the currently active playtest')
        .setDefaultMemberPermissions([GuildPermissions.MANAGE_CHANNELS]),
    async execute(interaction: Interaction): Promise<CommandResult> {
        // Get guild settings and verify there is currently a playtest
        const guildSettings = await DatabaseWrapper.GetGuildSettings(interaction.guild_id);
        if (guildSettings.activePlaytest == null) {
            return new CommandResult('There is currently no active playtest', false, false);
        }

        // Retrieve the active playtest object
        const playtest = await DatabaseWrapper.GetScheduledPlaytest(interaction.guild_id, guildSettings.activePlaytest);

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

        // Set active playtest to null
        await DatabaseWrapper.SetGuildActivePlaytest(interaction.guild_id, null);

        // Send message in playtest channel that playtest is ending
        const embed: Embed = {
            title: `Ending playtest of ${playtest.mapName} by <@${playtest.mainAuthor}>`,
            type: 'rich',
            description: `Demo will be retrieved from the server and posted in the announcements channel shortly`,
            footer: { text: `Playtest Id: ${playtest.Id}` },
        };
        await DiscordApiRoutes.createNewMessage(guildSettings.playtesting.cs2.playtestChannel, '', [embed]);

        // Download demo locally
        const demoPath = await FTPUtil.GetDemo(
            playtestRconServer.ftpHost,
            playtestRconServer.ftpPort,
            playtestRconServer.ftpUsername,
            playtestRconServer.ftpPassword,
            gameFolder,
            playtest.Id
        );
        if (demoPath === null) {
            return new CommandResult('Unable to download demo from server to lambda', false, false);
        }

        // Upload demo to S3
        const s3ObjectPath = await DatabaseWrapper.UploadFileToS3(demoPath, `Demos/${playtest.Id}.dem`);

        // Post link to object in S3 in announcement channel, mention creator
        await DiscordApiRoutes.createNewMessage(
            guildSettings.playtesting.cs2.announceChannel,
            `Demo for ${playtest.mapName} by <@${playtest.mainAuthor}>\n${s3ObjectPath}`
        );

        // Call demo parsing lambda
        const lambdaParameters = {
            DemoName: playtest.Id,
            GuildId: interaction.guild_id,
        };

        const lambdaParams: InvokeCommandInput = {
            FunctionName: 'squidbot_demo_parser',
            InvocationType: 'Event',
            LogType: 'Tail',
            Payload: JSON.stringify(lambdaParameters),
        };

        const client = new LambdaClient();
        const fetchCommand = new InvokeCommand(lambdaParams);
        const asciiDecoder = new TextDecoder('utf-8');

        const response = await client.send(fetchCommand);

        // Done :)
        return new CommandResult('Playtest successfully ended and all steps completed successfully', false, false);
    },
} as CommandDescription;
