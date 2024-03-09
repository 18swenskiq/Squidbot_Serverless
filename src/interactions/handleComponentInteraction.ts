import { DB_ComponentInteractionHandler } from '../database_models/interactionHandler';
import { ComponentInteractionData } from '../discord_api/componentInteraction';
import { Interaction } from '../discord_api/interaction';
import { DatabaseWrapper } from '../util/databaseWrapper';
import { Guid } from '../util/guid';
import { DiscordApiRoutes } from '../discord_api/apiRoutes';
import { DatabaseQuery } from '../util/database_query/databaseQuery';
import { DB_GuildSettings } from '../database_models/guildSettings';
import { DB_CS2PugQueue } from '../database_models/cs2PugQueue';
import { DB_UserSettings } from '../database_models/userSettings';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export abstract class HandleComponentInteraction {
    public static async Handle(interaction: Interaction): Promise<void> {
        const data = <ComponentInteractionData>interaction.data;

        const interactionHandler = await new DatabaseQuery()
            .GetObject<DB_ComponentInteractionHandler>(`${interaction.guild_id}/${data.custom_id}`)
            .Execute(DB_ComponentInteractionHandler);

        if (interactionHandler === null) {
            throw new Error('Interaction handler not found');
        }

        switch (interactionHandler.type) {
            case 'AssignRoles':
                await HandleComponentInteraction.AssignRoles(interaction, data, interactionHandler);
                break;
            case 'StopPUG':
                await HandleComponentInteraction.StopPUG(interaction, data, interactionHandler);
                break;
            case 'JoinPUG':
                await HandleComponentInteraction.JoinPUG(interaction, data, interactionHandler);
                break;
            case 'LeavePUG':
                await HandleComponentInteraction.LeavePUG(interaction, data, interactionHandler);
            default:
                console.log('Unexpected component interaction, aborting');
                break;
        }
    }

    private static async AssignRoles(
        interaction: Interaction,
        data: ComponentInteractionData,
        interactionHandler: DB_ComponentInteractionHandler
    ): Promise<void> {
        const guildSettings = await new DatabaseQuery()
            .GetObject<DB_GuildSettings>(interaction.guild_id)
            .Execute(DB_GuildSettings);

        if (guildSettings === null) {
            throw new Error('Guild not found when attempting to retrieve roles from database');
        }

        const assignableRoles = guildSettings.assignableRoles;

        const memberRoles = interaction.member.roles;
        const selectedRoles = data.values;

        const ignoreRoles = memberRoles.filter((r) => !assignableRoles.includes(r));

        const removeRoles = memberRoles.filter((r) => {
            if (ignoreRoles.includes(r)) {
                return false;
            }

            if (selectedRoles.includes(r)) {
                return false;
            }

            return true;
        });

        const addRoles = selectedRoles.filter((r) => !memberRoles.includes(r));

        // Remove roels from member
        for (let i = 0; i < removeRoles.length; i++) {
            await DiscordApiRoutes.removeMemberRole(interaction.guild_id, interaction.member.user.id, removeRoles[i]);
        }

        // Add roles to member
        for (let i = 0; i < addRoles.length; i++) {
            await DiscordApiRoutes.addMemberRole(interaction.guild_id, interaction.member.user.id, addRoles[i]);
        }

        // Update the interactionHandler
        await DatabaseWrapper.SetInteractionHandler(
            interactionHandler.createdBy,
            interaction.guild_id,
            data.custom_id as Guid,
            'AssignRoles',
            interactionHandler.timesHandled++
        );
    }

    private static async StopPUG(
        interaction: Interaction,
        data: ComponentInteractionData,
        interactionHandler: DB_ComponentInteractionHandler
    ): Promise<void> {
        const queues = await new DatabaseQuery()
            .GetObjects<DB_CS2PugQueue>()
            .WherePropertyEquals('stopQueueButtonId', <Guid>data.custom_id)
            .Execute(DB_CS2PugQueue);

        if (!queues || queues.length < 1) {
            throw new Error('Queue with this button not found');
        }

        const activeQueue = queues[0];
        console.log(activeQueue);

        if (activeQueue.usersInQueue[0] !== interaction.member.user.id) {
            await DiscordApiRoutes.createFollowupMessage(interaction, {
                content: 'Only the queue owner can stop the queue!',
                flags: 64,
            });
            return;
        }

        await new DatabaseQuery()
            .DeleteObject<DB_CS2PugQueue>(`${interaction.guild_id}/${activeQueue.id}`)
            .Execute(DB_CS2PugQueue);
        await DiscordApiRoutes.createNewMessage(
            interaction.channel_id,
            'The active queue has been ended by the leader'
        );
    }

    private static async JoinPUG(
        interaction: Interaction,
        data: ComponentInteractionData,
        interactionHandler: DB_ComponentInteractionHandler
    ): Promise<void> {
        // Get all queues
        const queues = await new DatabaseQuery().GetObjects<DB_CS2PugQueue>().Execute(DB_CS2PugQueue);
        console.log('print all queues');
        for (const printQueue in queues) {
            console.log(printQueue);
        }

        // Get time to determine if queue is timed out
        const curTime = new Date();

        // Ensure there is an active queue in the location this command is done
        const activeQueue = queues.find((q) => q.activeChannel === interaction.channel_id);

        if (activeQueue === undefined || curTime.getTime() > activeQueue.queueExpirationTime.getTime()) {
            await DiscordApiRoutes.createFollowupMessage(interaction, {
                content: 'This queue is expired',
                flags: 64,
            });
            return;
        }

        // Ensure the player isn't in another queue already
        if (queues.find((q) => q.usersInQueue.includes(interaction.member.user.id))) {
            // If the player is already in the active queue, remove them and quit
            if (activeQueue.usersInQueue.includes(interaction.member.user.id)) {
                await DiscordApiRoutes.createFollowupMessage(interaction, {
                    content: 'You are already in this queue!',
                    flags: 64,
                });
                return;
            }

            await DiscordApiRoutes.createFollowupMessage(interaction, {
                content: 'You cannot join a queue while you are already in an active queue!',
                flags: 64,
            });
            return;
        }

        // Ensure the player is steamlinked
        const userSettings = await new DatabaseQuery()
            .GetObject<DB_UserSettings>(interaction.member.user.id)
            .Execute(DB_UserSettings);

        if (userSettings === null || !userSettings.steamLink) {
            await DiscordApiRoutes.createFollowupMessage(interaction, {
                content: 'You must link your steam id with `/link` to queue',
                flags: 64,
            });
            return;
        }

        // Add player to queue
        await new DatabaseQuery()
            .ModifyObject<DB_CS2PugQueue>(`${interaction.guild_id}/${activeQueue.id}`)
            .AddToPropertyArray('usersInQueue', [interaction.member.user.id])
            .Execute(DB_CS2PugQueue);

        const user = await DiscordApiRoutes.getUser(interaction.member.user.id);
        await DiscordApiRoutes.createNewMessage(
            interaction.channel_id,
            `${user.username} has joined the queue. x players needed.`
        );
        return;

        // If queue is full, continue process
    }

    private static async LeavePUG(
        interaction: Interaction,
        data: ComponentInteractionData,
        interactionHandler: DB_ComponentInteractionHandler
    ): Promise<void> {
        const queues = await new DatabaseQuery().GetObjects<DB_CS2PugQueue>().Execute(DB_CS2PugQueue);
        console.log('print all queues');
        for (const printQueue in queues) {
            console.log(printQueue);
        }

        // Get time to determine if queue is timed out
        const curTime = new Date();

        // Ensure there is an active queue in the location this command is done
        const activeQueue = queues.find((q) => q.activeChannel === interaction.channel_id);

        if (activeQueue === undefined || curTime.getTime() > activeQueue.queueExpirationTime.getTime()) {
            await DiscordApiRoutes.createFollowupMessage(interaction, {
                content: 'This queue is expired',
                flags: 64,
            });
            return;
        }

        // If the player is already in the active queue, remove them and quit
        if (activeQueue.usersInQueue.includes(interaction.member.user.id)) {
            if (activeQueue.usersInQueue[0] === interaction.member.user.id) {
                await DiscordApiRoutes.createFollowupMessage(interaction, {
                    content:
                        'The queue leader cannot leave the queue. If you would like to leave, please end the queue',
                });
                return;
            }

            await new DatabaseQuery()
                .ModifyObject<DB_CS2PugQueue>(`${interaction.guild_id}/${activeQueue.id}`)
                .RemoveFromPropertyArray('usersInQueue', [interaction.member.user.id])
                .Execute(DB_CS2PugQueue);

            const user = await DiscordApiRoutes.getUser(interaction.member.user.id);
            await DiscordApiRoutes.createNewMessage(
                interaction.channel_id,
                `${user.username} has left the queue. x players needed.`
            );
            return;
        } else {
            await DiscordApiRoutes.createFollowupMessage(interaction, {
                content: 'You are not in this queue!',
                flags: 64,
            });
            return;
        }
    }
}
