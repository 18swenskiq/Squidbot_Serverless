import { type CommandDescription } from '../discord_api/command';
import { CommandResult } from '../discord_api/commandResult';
import { InteractionData, type Interaction } from '../discord_api/interaction';
import { GuildPermissions } from '../discord_api/permissions';
import { SlashCommandBuilder } from '../discord_api/slash_command_builder';
import { FTPUtil } from '../util/ftpUtil';
import { RconUtils } from '../util/rconUtil';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('test_cool')
        .setDescription('test description')
        .addStringOption((option) => option.setName('ftp_host').setDescription('host').setRequired(true))
        .addStringOption((option) => option.setName('ftp_port').setDescription('port').setRequired(true))
        .addStringOption((option) => option.setName('ftp_username').setDescription('ftp_username').setRequired(true))
        .addStringOption((option) => option.setName('ftp_password').setDescription('ftp_password').setRequired(true))
        .setDefaultMemberPermissions([GuildPermissions.ADMINISTRATOR]),
    async execute(interaction: Interaction): Promise<CommandResult> {
        const interactionData = <InteractionData>interaction.data;

        const ftpHost = interactionData.options.find((o) => o.name === 'ftp_host')?.value;
        const ftpPort = interactionData.options.find((o) => o.name === 'ftp_port')?.value;
        const ftpUsername = interactionData.options.find((o) => o.name === 'ftp_username')?.value;
        const ftpPassword = interactionData.options.find((o) => o.name === 'ftp_password')?.value;

        const result = await FTPUtil.FindGameFolder(ftpHost!, ftpPort!, ftpUsername!, ftpPassword!);

        return new CommandResult(result ? result : 'not found', false, false);
    },
} as CommandDescription;
