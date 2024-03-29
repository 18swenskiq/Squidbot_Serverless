import { type CommandDescription } from '../discord_api/command';
import { CommandResult } from '../discord_api/commandResult';
import { Embed, EmbedField } from '../discord_api/embed';
import { type Interaction } from '../discord_api/interaction';
import { SlashCommandBuilder } from '../discord_api/slash_command_builder';
import { DatabaseWrapper } from '../util/databaseWrapper';

module.exports = {
    data: new SlashCommandBuilder().setName('servers').setDescription('Lists the game servers for this server'),
    async execute(interaction: Interaction): Promise<CommandResult> {
        const servers = await DatabaseWrapper.GetGameServers(interaction.guild_id);

        if (servers.length === 0) {
            return new CommandResult('No servers :(', false, false);
        }

        const embed: Embed = {
            title: 'Game Servers',
            type: 'rich',
            fields: [],
        };

        servers.forEach((s) => {
            let gameDisplayName = 'Unknown Game';
            let countryCode = '';

            if (s.game === 'cs2') {
                gameDisplayName = 'Counter-Strike 2';
            }

            if (s.countryCode && s.countryCode !== '') {
                countryCode = `:flag_${s.countryCode.toLowerCase()}:`;
            }

            const embedTitle = `${s.ip}:${s.port}`;
            const embedValue = `Game: \`${gameDisplayName}\``;

            const field: EmbedField = {
                name: embedTitle,
                value: embedValue,
                inline: false,
            };

            embed.fields?.push(field);
        });

        const cr = new CommandResult(``, false, false);
        cr.embeds = [embed];
        return cr;
    },
} as CommandDescription;
