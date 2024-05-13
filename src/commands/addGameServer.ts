import { RconServer } from '../database_models/rconServer';
import { Services } from '../database_services/services';
import { type CommandDescription } from '../discord_api/command';
import { CommandResult } from '../discord_api/commandResult';
import { InteractionData, type Interaction } from '../discord_api/interaction';
import { GuildPermissions } from '../discord_api/permissions';
import { SlashCommandBuilder } from '../discord_api/slash_command_builder';
import { Game } from '../enums/Game';
import { DatabaseWrapper } from '../util/databaseWrapper';
import { GenerateGuid } from '../util/guid';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add_game_server')
        .setDescription('Adds a game server that is tied to this discord server')
        .addStringOption((option) =>
            option
                .setName('game')
                .setDescription('The game that this server is for')
                .setRequired(true)
                .addChoices([{ name: 'Counter-Strike 2', value: 'cs2' }])
        )
        .addStringOption((option) =>
            option.setName('ip').setDescription("The IP of the game server (don't include the port)").setRequired(true)
        )
        .addStringOption((option) =>
            option.setName('port').setDescription('The port of the game server').setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName('nickname')
                .setDescription('The friendly nickname of the server to refer to it as')
                .setRequired(true)
        )
        .addStringOption((option) =>
            option.setName('rcon_password').setDescription('The RCON password').setRequired(true)
        )
        .addStringOption((option) =>
            option.setName('ftp_host').setDescription('The FTP host IP (port not included)').setRequired(true)
        )
        .addStringOption((option) => option.setName('ftp_port').setDescription('The FTP port').setRequired(true))
        .addStringOption((option) =>
            option.setName('ftp_username').setDescription('The FTP username').setRequired(true)
        )
        .addStringOption((option) =>
            option.setName('ftp_password').setDescription('The FTP password').setRequired(true)
        )
        .setDefaultMemberPermissions([GuildPermissions.MANAGE_CHANNELS]),
    async execute(interaction: Interaction): Promise<CommandResult> {
        const interactionData = <InteractionData>interaction.data;

        const chosenGame = interactionData.options.find((o) => o.name === 'game')?.value;
        const chosenIp = interactionData.options.find((o) => o.name === 'ip')?.value;
        const chosenPort = interactionData.options.find((o) => o.name === 'port')?.value;
        const chosenNickname = interactionData.options.find((o) => o.name === 'nickname')?.value;
        const chosenRconPassword = interactionData.options.find((o) => o.name === 'rcon_password')?.value;
        const chosenFlag = interactionData.options.find((o) => o.name === 'flag')?.value ?? '';
        const ftpHost = interactionData.options.find((o) => o.name === 'ftp_host')?.value;
        const ftpPort = interactionData.options.find((o) => o.name === 'ftp_port')?.value;
        const ftpUsername = interactionData.options.find((o) => o.name === 'ftp_username')?.value;
        const ftpPassword = interactionData.options.find((o) => o.name === 'ftp_password')?.value;

        const existingGameServers = await Services.RconServerSvc.GetAllWhere({ guildId: interaction.guild_id });

        // Verify we aren't adding a duplicate game server
        for (let i = 0; i < existingGameServers.length - 1; i++) {
            const server = existingGameServers[i];

            if (server.ip === chosenIp) {
                return new CommandResult('A game server already exists with this IP!', true, true);
            }

            if (server.nickname === chosenNickname) {
                return new CommandResult('A game server already exists with this Nickname!', true, true);
            }
        }

        const serverId = GenerateGuid();

        const server = new RconServer();
        server.nickname = <string>chosenNickname;
        server.ip = <string>chosenIp;
        server.port = <string>chosenPort;
        server.game = Game.cs2;
        server.guildId = interaction.guild_id;
        server.rconPassword = <string>chosenRconPassword;
        server.countryCode = chosenFlag;
        server.ftpHost = <string>ftpHost;
        server.ftpPort = <string>ftpPort;
        server.ftpUsername = <string>ftpUsername;
        server.ftpPassword = <string>ftpPassword;
        await Services.RconServerSvc.Save(server);

        return new CommandResult(`Added Game Server \`${<string>chosenNickname}\``, true, true, '', true);
    },
} as CommandDescription;
