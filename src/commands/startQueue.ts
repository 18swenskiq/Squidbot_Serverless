import { type CommandDescription } from '../discord_api/command';
import { CommandResult } from '../discord_api/commandResult';
import { InteractionData, type Interaction } from '../discord_api/interaction';
import { SlashCommandBuilder } from '../discord_api/slash_command_builder';
import { DatabaseWrapper } from '../util/databaseWrapper';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('startqueue')
        .setDescription('Starts a pugging queue (pugging must be enabled)'),
    async execute(interaction: Interaction): Promise<CommandResult> {
        const interactionData = <InteractionData>interaction.data;

        // Delete any stale queues

        // Ensure there is not currently a queue in this server/channel

        // Ensure user is not currently part of a different queue

        // Create object

        await DatabaseWrapper.EnableCS2Pugging(interaction.guild_id);
        return new CommandResult('Enabled CS2 pugging on this server!', true, false);
    },
} as CommandDescription;
