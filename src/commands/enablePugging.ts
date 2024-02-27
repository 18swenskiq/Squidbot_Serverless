import { DB_GuildSettings } from '../database_models/guildSettings';
import { type CommandDescription } from '../discord_api/command';
import { CommandResult } from '../discord_api/commandResult';
import { InteractionData, type Interaction } from '../discord_api/interaction';
import { SlashCommandBuilder } from '../discord_api/slash_command_builder';
import { DatabaseWrapper } from '../util/databaseWrapper';
import { DatabaseQuery } from '../util/database_query/databaseQuery';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('enable_pugging')
        .setDescription('Enable pugging for CS2')
        .setAllowedUsersOnly(['66318815247466496']),
    async execute(interaction: Interaction): Promise<CommandResult> {
        const interactionData = <InteractionData>interaction.data;

        await new DatabaseQuery()
            .ModifyObject<DB_GuildSettings>(interaction.guild_id)
            .SetProperty('pugging_cs2_enabled', true)
            .Execute(DB_GuildSettings);

        return new CommandResult('Enabled CS2 pugging on this server!', true, false);
    },
} as CommandDescription;
