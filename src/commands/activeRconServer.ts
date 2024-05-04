import { type CommandDescription } from '../discord_api/command.js';
import { CommandResult } from '../discord_api/commandResult';
import { InteractionData, InteractionDataOptions, type Interaction } from '../discord_api/interaction';
import { GuildPermissions } from '../discord_api/permissions';
import { SlashCommandBuilder } from '../discord_api/slash_command_builder';
import { DatabaseWrapper } from '../util/databaseWrapper';

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
        const servers = await DatabaseWrapper.GetGameServers(interaction.guild_id);

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
                    await DatabaseWrapper.SetActiveRconServer(
                        interaction.member.user.id,
                        interaction.guild_id,
                        server.id
                    );

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

        const res = await DatabaseWrapper.GetActiveRconServer(interaction.member.user.id, interaction.guild_id);
        if (res?.ip) {
            return new CommandResult(`Current active server is \`${res.ip}:${res.port}\``, true, false);
        }

        return new CommandResult('Currently no RCON server registered', true, false);
    },
    async autocomplete(interaction: Interaction): Promise<InteractionDataOptions[] | null> {
        const data = <InteractionData>interaction.data;
        if (data.options.find((o) => o.name === 'server')) {
            const value = data.options.find((o) => o.name === 'server')?.value;
            if (value) {
                const servers = await DatabaseWrapper.GetGameServers(interaction.guild_id);
                const match = servers.filter((s) => s.ip.toLowerCase().startsWith(value));

                if (match) {
                    return match.map((m) => new InteractionDataOptions(3, 'server', m.ip));
                }
            }
        }
        return null;
    },
} as CommandDescription;
