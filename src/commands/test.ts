import { type CommandDescription } from '../discord_api/command';
import { CommandResult } from '../discord_api/commandResult';
import { InteractionData, type Interaction } from '../discord_api/interaction';
import { GuildPermissions } from '../discord_api/permissions';
import { SlashCommandBuilder } from '../discord_api/slash_command_builder';
import { SteamApi } from '../steam_api/steamApi';
import { FTPUtil } from '../util/ftpUtil';
import { RconUtils } from '../util/rconUtil';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('test_cool')
        .setDescription('test description')
        .setDefaultMemberPermissions([GuildPermissions.ADMINISTRATOR]),
    async execute(interaction: Interaction): Promise<CommandResult> {
        const interactionData = <InteractionData>interaction.data;

        const maps = await SteamApi.GetCSGOWorkshopMapsInCollection('2747675401');

        return new CommandResult(maps.map((m) => `${m.title}`).join(', '), false, false);
    },
} as CommandDescription;
