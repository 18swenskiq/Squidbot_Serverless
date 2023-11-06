import Rcon from 'ts-rcon';
import { type CommandDescription } from '../discord_api/command';
import { CommandResult } from '../discord_api/commandResult';
import { InteractionData, type Interaction } from '../discord_api/interaction';
import { GuildPermissions } from '../discord_api/permissions';
import { SlashCommandBuilder } from '../discord_api/slash_command_builder';
import { DatabaseWrapper } from '../util/databaseWrapper';

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

        var options = {
            tcp: true,
            challenge: false,
        };

        const client = new Rcon(rconServer.ip, Number(rconServer.port), rconServer.rconPassword, options);
        client
            .on('auth', function () {
                console.log('Authenticated');
                console.log(`Sending RCON command - ${command}`);

                client.send(<string>command);
            })
            .on('repsonse', function (str) {
                console.log('Rcon Response - ' + str);
                client.disconnect();
            })
            .on('error', function (err) {
                console.log('Error: ' + err);
                client.disconnect();
            })
            .on('end', function () {
                console.log('RCON Connection Closed');
                client.disconnect();
            });

        client.connect();

        return new CommandResult(
            'check the aws logs you dumb loser, you havent added the response here yet',
            false,
            false
        );
    },
} as CommandDescription;
