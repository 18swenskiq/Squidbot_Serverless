import { DB_CS2PugQueue } from '../database_models/cs2PugQueue';
import { DiscordApiRoutes } from '../discord_api/apiRoutes';
import { type CommandDescription } from '../discord_api/command';
import { CommandResult } from '../discord_api/commandResult';
import { InteractionData, type Interaction } from '../discord_api/interaction';
import { GuildPermissions } from '../discord_api/permissions';
import { SlashCommandBuilder } from '../discord_api/slash_command_builder';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('delete_all_pug_queues')
        .setDescription('test description')
        .setDefaultMemberPermissions([GuildPermissions.ADMINISTRATOR]),
    async execute(interaction: Interaction): Promise<CommandResult> {
        const interactionData = <InteractionData>interaction.data;

        /*
        const objs = await new DatabaseQuery().ListObjects<DB_CS2PugQueue>().Execute(DB_CS2PugQueue);

        await DiscordApiRoutes.createNewMessage(interaction.channel_id, `Found ${objs.length} objects to be deleted`);

        for (let i = 0; i < objs.length; i++) {
            const obj = objs[i];
            const blank_obj = new DB_CS2PugQueue();
            await new DatabaseQuery().DeleteObject('WHO CARES').Execute(DB_CS2PugQueue);
        }

        */
        return new CommandResult(`Deleted ${0} objects`, false, false);
    },
} as CommandDescription;
