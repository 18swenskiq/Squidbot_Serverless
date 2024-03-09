import { DB_CS2PugQueue } from '../database_models/cs2PugQueue';
import { DB_GuildSettings } from '../database_models/guildSettings';
import { DB_UserSettings } from '../database_models/userSettings';
import { DiscordApiRoutes } from '../discord_api/apiRoutes';
import { type CommandDescription } from '../discord_api/command';
import { CommandResult } from '../discord_api/commandResult';
import { Embed } from '../discord_api/embed';
import { InteractionData, type Interaction } from '../discord_api/interaction';
import { ButtonComponent } from '../discord_api/messageComponent';
import { SlashCommandBuilder } from '../discord_api/slash_command_builder';
import { CS2PUGGameMode } from '../enums/CS2PUGGameMode';
import { DatabaseWrapper } from '../util/databaseWrapper';
import { DatabaseQuery } from '../util/database_query/databaseQuery';
import { GenerateGuid } from '../util/guid';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('startqueue')
        .setDescription('Starts a pugging queue (pugging must be enabled)')
        .addStringOption((option) =>
            option
                .setName('gamemode')
                .setDescription('The gamemode of the queue')
                .setRequired(true)
                .addChoices([
                    { name: '2v2', value: CS2PUGGameMode.wingman },
                    { name: '3v3', value: CS2PUGGameMode.threesome },
                    { name: '5v5', value: CS2PUGGameMode.classic },
                ])
        ),
    async execute(interaction: Interaction): Promise<CommandResult> {
        const interactionData = <InteractionData>interaction.data;

        const gameMode = <CS2PUGGameMode>(<unknown>interactionData.options.find((o) => o.name === 'gamemode')?.value);

        // Ensure pugging is enabled on this server
        const guildSettings = await new DatabaseQuery()
            .GetObject<DB_GuildSettings>(interaction.guild_id)
            .CreateIfNotExist()
            .Execute(DB_GuildSettings);

        if (guildSettings === null) {
            throw new Error('Unable to find guild settings');
        }

        if (!guildSettings.pugging_cs2_enabled) {
            return new CommandResult('CS2 pugging is not enabled on this server!', false, false);
        }

        // Ensure player has been linked to steam
        const userSettings = await new DatabaseQuery()
            .GetObject<DB_UserSettings>(interaction.member.user.id)
            .Execute(DB_UserSettings);

        if (!userSettings?.steamLink) {
            return new CommandResult(
                'Before joining a queue, you must link your discord account to your steam account with `/link`',
                false,
                false
            );
        }

        // Get current queues
        const queues = await new DatabaseQuery().GetObjects<DB_CS2PugQueue>().Execute(DB_CS2PugQueue);

        console.log('queues');
        console.log(queues);

        // Delete any stale queues
        for (let i = 0; i < queues.length; i++) {
            const queue = queues[i];
            const currentTime = new Date();

            console.log(`Loop ${i}`);
            console.log(queue);
            console.log(currentTime);
            console.log('cool test');
            console.log(queue.queueExpirationTime.getTime());

            if (currentTime.getTime() > queue.queueExpirationTime.getTime()) {
                // In this case, the queue is expired so we can delete it
                await new DatabaseQuery()
                    .DeleteObject<DB_CS2PugQueue>(`${interaction.guild_id}/${queue.id}`)
                    .Execute(DB_CS2PugQueue);
            }
        }

        // Ensure there is not currently a queue in this server/channel
        const activeQueueNames = await new DatabaseQuery().ListObjects<DB_CS2PugQueue>().Execute(DB_CS2PugQueue);
        if (activeQueueNames.find((q) => q.includes(interaction.guild_id))) {
            throw new Error('There is already an active queue in this server!');
        }

        // Ensure user is not currently part of a different queue
        const activeQueues = await new DatabaseQuery().GetObjects<DB_CS2PugQueue>().Execute(DB_CS2PugQueue);

        if (activeQueues.find((q) => q.usersInQueue.includes(interaction.member.user.id))) {
            throw new Error('A user who is already a member of an active queue cannot start another!');
        }

        // Create object
        const stopButtonId = GenerateGuid();
        const joinButtonId = GenerateGuid();
        const leaveButtonId = GenerateGuid();

        const queueId = GenerateGuid();
        const queueObject = await new DatabaseQuery()
            .CreateNewObject<DB_CS2PugQueue>(`${interaction.guild_id}/${queueId}`)
            .SetProperty('id', queueId)
            .SetProperty('activeChannel', interaction.channel_id)
            .SetProperty('gameType', gameMode)
            .SetProperty('stopQueueButtonId', stopButtonId)
            .SetProperty('joinQueueButtonId', joinButtonId)
            .SetProperty('leaveQueueButtonId', leaveButtonId)
            .SetProperty('usersInQueue', [interaction.member.user.id])
            .Execute(DB_CS2PugQueue);

        // Create embed showing queue
        try {
            const queueStarter = await DiscordApiRoutes.getUser(interaction.member.user.id);
            const embed: Embed = {
                title: `${queueStarter.username} started a ${gameMode} queue!`,
                description: 'Use `/queue` in this channel to join!',
                type: 'rich',
                color: 6730746,
                fields: [
                    {
                        name: 'Queue end time:',
                        value: `<t:${Math.round(queueObject.queueExpirationTime.getTime() / 1000)}:R>`,
                        inline: true,
                    },
                ],
            };

            // Stop button
            const stopQueueButton = new ButtonComponent();
            stopQueueButton.custom_id = stopButtonId;
            stopQueueButton.label = 'Stop Queue';
            stopQueueButton.style = 4;

            await DatabaseWrapper.SetInteractionHandler(
                interaction.member.user.id,
                interaction.guild_id,
                stopButtonId,
                'StopPUG'
            );

            // Join button
            const joinQueueButton = new ButtonComponent();
            joinQueueButton.custom_id = joinButtonId;
            joinQueueButton.label = 'Join Queue';
            joinQueueButton.style = 2;

            await DatabaseWrapper.SetInteractionHandler(
                interaction.member.user.id,
                interaction.guild_id,
                joinButtonId,
                'JoinPUG'
            );

            // Leave button
            const leaveQueueButton = new ButtonComponent();
            leaveQueueButton.custom_id = leaveButtonId;
            leaveQueueButton.label = 'Leave Queue';
            leaveQueueButton.style = 4;

            await DatabaseWrapper.SetInteractionHandler(
                interaction.member.user.id,
                interaction.guild_id,
                leaveButtonId,
                'LeavePUG'
            );

            const cr = new CommandResult('', true, false);
            cr.embeds = [];
            cr.embeds.push(embed);

            cr.components = [];

            const componentWrapper: any = { type: 1, components: [] };
            componentWrapper.components.push(<any>joinQueueButton);
            componentWrapper.components.push(<any>leaveQueueButton);
            componentWrapper.components.push(<any>stopQueueButton);

            cr.components.push(componentWrapper);
            return cr;
        } catch {
            return new CommandResult(`Failed: Time: ${queueObject.queueExpirationTime}`, false, false);
        }
    },
} as CommandDescription;
