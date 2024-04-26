import { Collection } from 's3-db';
import { type CommandDescription } from '../discord_api/command';
import { CommandResult } from '../discord_api/commandResult';
import { InteractionData, type Interaction } from '../discord_api/interaction';
import { GuildPermissions } from '../discord_api/permissions';
import { SlashCommandBuilder } from '../discord_api/slash_command_builder';
import { SteamApi } from '../steam_api/steamApi';
import { DB_UserSettings } from '../database_models/userSettings';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('test_cool')
        .setDescription('test description')
        .setDefaultMemberPermissions([GuildPermissions.ADMINISTRATOR]),
    async execute(interaction: Interaction): Promise<CommandResult> {
        const interactionData = <InteractionData>interaction.data;

        const collection = new Collection(new DB_UserSettings());

        const user = await collection.save({ steamLink: '5' });

        return new CommandResult('Updated user', false, false);
    },
} as CommandDescription;
