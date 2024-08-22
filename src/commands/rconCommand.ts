import { Services } from '../database_services/services';
import { type CommandDescription } from '../discord_api/command';
import { CommandResult } from '../discord_api/commandResult';
import { InteractionData, type Interaction } from '../discord_api/interaction';
import { GuildPermissions } from '../discord_api/permissions';
import { SlashCommandBuilder } from '../discord_api/slash_command_builder';
import Rcon from 'rcon-ts';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rcon')
        .setDescription('Send an rcon command to your active server')
        .addStringOption((option) => option.setName('command').setDescription('The command to send').setRequired(true))
        .setDefaultMemberPermissions([GuildPermissions.MANAGE_CHANNELS]),
    async execute(interaction: Interaction): Promise<CommandResult> {
        const interactionData = <InteractionData>interaction.data;
        const command = interactionData.options.find((o) => o.name === 'command')?.value;

        const rconServers = await Services.ActiveRconServerSvc.GetAllWhere({
            guildId: interaction.guild_id,
            userSettings: { id: interaction.member.user.id },
        });

        if (rconServers.length === 0) {
            return new CommandResult('No active RCON server!', false, false);
        }

        if (rconServers.length > 1) {
            return new CommandResult(
                'More than one active rcon server found. This is an invalid data state. Aborting.',
                false,
                false
            );
        }

        const rconServer = rconServers[0];

        const rcon = new Rcon({
            host: rconServer.rconServer.ip,
            port: Number(rconServer.rconServer.port),
            password: rconServer.rconServer.rconPassword,
            timeout: 5000,
        });

        rcon.connect();
        let response = await rcon.send(<string>command);
        rcon.disconnect();

        const errors = rcon.errors;

        if (errors.length) {
            console.warn('Errors: ', errors);
            return new CommandResult(errors.join(', '), false, false);
        }

        if (response === '') {
            return new CommandResult('No response from server', false, false);
        }

        console.log('Response: ', response);
        return new CommandResult('```\n' + response + '\n```', false, false);
    },
} as CommandDescription;
