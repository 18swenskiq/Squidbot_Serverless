import { DB_ComponentInteractionHandler } from '../database_models/interactionHandler';
import { ComponentInteractionData } from '../discord_api/componentInteraction';
import { Interaction } from '../discord_api/interaction';
import { DatabaseWrapper } from '../util/databaseWrapper';
import { Guid } from '../util/guid';
import { DiscordApiRoutes } from '../discord_api/apiRoutes';
import { DatabaseQuery } from '../util/database_query/databaseQuery';
import { DB_GuildSettings } from '../database_models/guildSettings';
import { DB_CS2PugQueue } from '../database_models/cs2PugQueue';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export abstract class HandleComponentInteraction {
    public static async Handle(interaction: Interaction): Promise<void> {
        const data = <ComponentInteractionData>interaction.data;

        /*
        const interactionHandler = await DatabaseWrapper.GetInteractionHandler(
            interaction.guild_id,
            data.custom_id as Guid
        );
        */

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
        // const assignableRoles = await DatabaseWrapper.GetGuildRolesAssignable(interaction.guild_id);
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
        await DiscordApiRoutes.createFollowupMessage(interaction, { content: 'Queue Ended' });
    }
}
