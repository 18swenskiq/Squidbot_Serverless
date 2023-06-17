import { DB_ComponentInteractionHandler } from '../database_models/interactionHandler';
import { ComponentInteractionData } from '../discord_api/componentInteraction';
import { Interaction } from '../discord_api/interaction';
import { DatabaseWrapper } from '../util/databaseWrapper';
import { Guid } from '../util/guid';
import { DiscordApiRoutes } from '../discord_api/apiRoutes';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export abstract class HandleComponentInteraction {
  public static async Handle (interaction: Interaction): Promise<void> {
    const data = <ComponentInteractionData>interaction.data;

    const interactionHandler = await DatabaseWrapper.GetInteractionHandler(interaction.guild_id, data.custom_id as Guid);

    switch (interactionHandler.type) {
      case 'AssignRoles':
        await HandleComponentInteraction.AssignRoles(interaction, data, interactionHandler);
        break;
      default:
        console.log('Unexpected component interaction, aborting');
        break;
    }
  }

  private static async AssignRoles (interaction: Interaction, data: ComponentInteractionData, interactionHandler: DB_ComponentInteractionHandler): Promise<void> {
    const assignableRoles = await DatabaseWrapper.GetGuildRolesAssignable(interaction.guild_id);
    const memberRoles = interaction.member.roles;
    const selectedRoles = data.values;

    const ignoreRoles = memberRoles.filter(r => !assignableRoles.includes(r));

    const removeRoles = memberRoles.filter(r => {
      if (ignoreRoles.includes(r)) {
        return false;
      }

      if (selectedRoles.includes(r)) {
        return false;
      }

      return true;
    });

    const addRoles = selectedRoles.filter(r => !memberRoles.includes(r));

    // Remove roels from member
    for (let i = 0; i < removeRoles.length; i++) {
      await DiscordApiRoutes.removeMemberRole(interaction.guild_id, interaction.member.user.id, removeRoles[i]);
    }

    // Add roles to member
    for (let i = 0; i < addRoles.length; i++) {
      await DiscordApiRoutes.addMemberRole(interaction.guild_id, interaction.member.user.id, addRoles[i]);
    }

    // Update the interactionHandler
    await DatabaseWrapper.SetInteractionHandler(interactionHandler.createdBy, interaction.guild_id, data.custom_id as Guid, 'AssignRoles', interactionHandler.timesHandled++);
  }
}
