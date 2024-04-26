import { DB_PlaytestRequest } from '../database_models/playtestRequest';
import { DB_ScheduledPlaytest } from '../database_models/scheduledPlaytest';
import { DiscordApiRoutes } from '../discord_api/apiRoutes';
import { type CommandDescription } from '../discord_api/command';
import { CommandResult } from '../discord_api/commandResult';
import { InteractionData, type Interaction } from '../discord_api/interaction';
import { GuildPermissions } from '../discord_api/permissions';
import { SlashCommandBuilder } from '../discord_api/slash_command_builder';
import { DatabaseWrapper } from '../util/databaseWrapper';
import { Guid } from '../util/guid';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cancel_playtest')
        .setDescription('Cancels a scheduled playtest')
        .addStringOption((option) =>
            option.setName('playtest_id').setDescription('The id of the playtest to cancel').setRequired(true)
        )
        .setDefaultMemberPermissions([GuildPermissions.MANAGE_CHANNELS]),
    async execute(interaction: Interaction): Promise<CommandResult> {
        const interactionData = <InteractionData>interaction.data;
        const id = interactionData.options.find((o) => o.name === 'playtest_id')?.value;

        /*
        const playtestDetails = await new DatabaseQuery()
            .GetObject<DB_ScheduledPlaytest>(`${interaction.guild_id}/${id}`)
            .Execute(DB_ScheduledPlaytest);

        if (playtestDetails === null) {
            throw new Error('Could not find scheduled playtest in database');
        }

        // Delete calendar event
        await DiscordApiRoutes.deleteGuildEvent(interaction.guild_id, playtestDetails.eventId);

        // Delete from DB
        await new DatabaseQuery()
            .DeleteObject<DB_ScheduledPlaytest>(`${interaction.guild_id}/${id}`)
            .Execute(DB_ScheduledPlaytest);

            */
        return new CommandResult('Cancelled playtest', false, false);
    },
} as CommandDescription;
