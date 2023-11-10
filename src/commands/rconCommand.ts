import { type CommandDescription } from '../discord_api/command';
import { CommandResult } from '../discord_api/commandResult';
import { InteractionData, type Interaction } from '../discord_api/interaction';
import { GuildPermissions } from '../discord_api/permissions';
import { SlashCommandBuilder } from '../discord_api/slash_command_builder';
import { DatabaseWrapper } from '../util/databaseWrapper';
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

        // Get current RCON server
        const rconServer = await DatabaseWrapper.GetActiveRconServer(interaction.member.user.id, interaction.guild_id);

        if (!rconServer) {
            return new CommandResult('No active RCON server!', false, false);
        }

        var options = {
            tcp: true,
            challenge: false,
        };

        const rcon = new Rcon({
            host: rconServer.ip,
            port: Number(rconServer.port),
            password: rconServer.rconPassword,
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
