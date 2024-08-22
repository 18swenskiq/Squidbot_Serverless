import { UserSettings } from '../database_models/userSettings.js';
import { Services } from '../database_services/services.js';
import { type CommandDescription } from '../discord_api/command.js';
import { CommandResult } from '../discord_api/commandResult';
import { InteractionData, type Interaction } from '../discord_api/interaction';
import { GuildPermissions } from '../discord_api/permissions';
import { SlashCommandBuilder } from '../discord_api/slash_command_builder';
import { GenerateGuid } from '../util/guid.js';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('active_rcon_server')
        .setDescription('Sets or gets the active rcon server')
        .addStringOption((option) =>
            option
                .setName('server')
                .setDescription('The IP of the Game Server to set as active')
                .setRequired(false)
                .enableAutocomplete()
        )
        .setDefaultMemberPermissions([GuildPermissions.MANAGE_CHANNELS]),
    async execute(interaction: Interaction): Promise<CommandResult> {
        const servers = await Services.RconServerSvc.GetAllWhere({ guildId: interaction.guild_id });

        if (!servers || servers.length === 0) {
            return new CommandResult(
                'No servers registered for this guild! Use /add_game_server to add some!',
                false,
                false
            );
        }

        const options = (<InteractionData>interaction.data).options;
        if (options?.length > 0) {
            const chosenServerIp = options.find((o) => o.name === 'server')?.value;

            // If the server input was provided
            if (chosenServerIp) {
                const server = servers.find((s) => s.ip === chosenServerIp);

                if (server) {
                    const previouslyActiveServers = await Services.ActiveRconServerSvc.GetAllWhere({
                        userSettings: { id: interaction.member.user.id },
                        guildId: interaction.guild_id,
                    });

                    const userSettings =
                        (await Services.UserSettingsSvc.GetById(interaction.member.user.id)) ??
                        <UserSettings>{ id: interaction.member.user.id };

                    if (previouslyActiveServers.length > 1) {
                        return new CommandResult(
                            'User has multiple active servers for current guild. This is an invalid data state. Aborting',
                            false,
                            false
                        );
                    } else if (previouslyActiveServers.length == 0) {
                        await Services.ActiveRconServerSvc.Save({
                            id: GenerateGuid(),
                            rconServer: server,
                            userSettings: userSettings,
                            guildId: interaction.guild_id,
                        });
                    } else {
                        const activeServer = previouslyActiveServers[0];
                        activeServer.rconServer = server;
                        await Services.ActiveRconServerSvc.Save(activeServer);
                    }

                    return new CommandResult(
                        `Set the active server to \`${server.ip}:${server.port}\` (${server.nickname})`,
                        true,
                        false
                    );
                } else {
                    return new CommandResult(
                        'Input was not recognized as a registered RCON server for this guild.',
                        true,
                        false
                    );
                }
            }
        }

        const res = await Services.ActiveRconServerSvc.GetAllWhere({
            guildId: interaction.guild_id,
            userSettings: { id: interaction.member.user.id },
        });
        if (res.length > 0) {
            const resServer = res[0].rconServer;
            return new CommandResult(`Current active server is \`${resServer.ip}:${resServer.port}\``, true, false);
        }

        return new CommandResult('Currently no RCON server registered', true, false);
    },
} as CommandDescription;
