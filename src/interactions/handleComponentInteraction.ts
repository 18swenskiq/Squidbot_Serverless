import { ComponentInteractionHandler } from '../database_models/componentInteractionHandler';
import { ComponentInteractionData } from '../discord_api/componentInteraction';
import { Interaction } from '../discord_api/interaction';
import { GenerateGuid, Guid } from '../util/guid';
import { DiscordApiRoutes } from '../discord_api/apiRoutes';
import { CS2PugQueue } from '../database_models/cs2PugQueue';
import { SteamApi } from '../steam_api/steamApi';
import { PugQueueUtil } from '../util/pugQueueUitl';
import { Services } from '../database_services/services';
import { SelectOption, StringSelectComponent } from '../discord_api/messageComponent';
import { CS2PUGMapSelectionMode } from '../enums/CS2PUGMapSelectionMode';
import { StaticDeclarations } from '../util/staticDeclarations';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export abstract class HandleComponentInteraction {
  public static async Handle (interaction: Interaction): Promise<void> {
    const data = <ComponentInteractionData>interaction.data;

    const interactionHandler = await Services.ComponentInteractionHandlerSvc.GetById(<Guid>data.custom_id);

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
        break;
      case 'PUGMapVote':
        await HandleComponentInteraction.PUGMapVote(interaction, data, interactionHandler);
        break;
      default:
        console.log('Unexpected component interaction, aborting');
        break;
    }
  }

  private static async AssignRoles (
    interaction: Interaction,
    data: ComponentInteractionData,
    interactionHandler: ComponentInteractionHandler
  ): Promise<void> {
    const guildSettings = await Services.GuildSettingsSvc.GetById(interaction.guild_id);

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
    interactionHandler.timesHandled++;
    await Services.ComponentInteractionHandlerSvc.Save(interactionHandler);
  }

  private static async StopPUG (
    interaction: Interaction,
    data: ComponentInteractionData,
    interactionHandler: ComponentInteractionHandler
  ): Promise<void> {
    const activeQueue = await this.GetActiveQueue(interaction, interactionHandler, true);

    if (activeQueue == null) {
      return;
    }

    if (activeQueue.userIdsInQueue[0] !== interaction.member.user.id) {
      await DiscordApiRoutes.createFollowupMessage(interaction, {
        content: 'Only the queue owner can stop the queue!',
        flags: 64
      });
      return;
    }

    activeQueue.queueEnded = true;
    await Services.CS2PugQueueSvc.Save(activeQueue);

    await DiscordApiRoutes.createNewMessage(
      interaction.channel_id,
      'The active queue has been ended by the leader'
    );
  }

  private static async JoinPUG (
    interaction: Interaction,
    data: ComponentInteractionData,
    interactionHandler: ComponentInteractionHandler
  ): Promise<void> {
    const activeQueue = await this.GetActiveQueue(interaction, interactionHandler, true);

    if (activeQueue == null) {
      return;
    }

    const maxPlayersForGamemode = PugQueueUtil.GetMaxPlayersForGamemode(activeQueue.gameType);

    // Ensure queue isn't already full/started
    if (activeQueue.userIdsInQueue.length === maxPlayersForGamemode) {
      await DiscordApiRoutes.createFollowupMessage(interaction, {
        content: 'This queue is already full',
        flags: 64
      });
      return;
    }

    // TODO: Known potential issue that probably won't ever matter. If there are multiple valid active queues,
    // we should actually check if the player is in one already.

    // Ensure the player isn't in another queue already
    // eslint-disable-next-line no-constant-condition
    if (true) {
      // If the player is already in the active queue, quit
      if (activeQueue.userIdsInQueue.includes(interaction.member.user.id)) {
        await DiscordApiRoutes.createFollowupMessage(interaction, {
          content: 'You are already in this queue!',
          flags: 64
        });
        return;
      }
    }

    // Ensure the player is steamlinked
    const userSettings = await Services.UserSettingsSvc.GetById(interaction.member.user.id);

    if (userSettings === null || (userSettings.steamLink == null)) {
      await DiscordApiRoutes.createFollowupMessage(interaction, {
        content: 'You must link your steam id with `/link` to queue',
        flags: 64
      });
      return;
    }

    const voteDropdownInteractionGuid: Guid = GenerateGuid();

    // Add player to queue
    await new DatabaseQuery()
      .ModifyObject<DB_CS2PugQueue>(`${interaction.guild_id}/${activeQueue.id}`)
      .AddToPropertyArray('usersInQueue', [interaction.member.user.id])
      .SetProperty('voteComponentId', voteDropdownInteractionGuid)
      .Execute(DB_CS2PugQueue);

    const currentPlayerCount = activeQueue.usersInQueue.length + 1;

    if (currentPlayerCount !== maxPlayersForGamemode) {
      const user = await DiscordApiRoutes.getUser(interaction.member.user.id);
      await DiscordApiRoutes.createNewMessage(
        interaction.channel_id,
        `${user.username} has joined the queue. ${maxPlayersForGamemode - currentPlayerCount} players needed.`
      );
      return;
    }

    // If queue is full, continue process
    await DiscordApiRoutes.createNewMessage(interaction.channel_id, 'Queue is full! Starting...');

    // Map Selection process
    const collectionId = StaticDeclarations.CollectionIdForGamemode(activeQueue.gameType);
    const maps = await SteamApi.GetCSGOWorkshopMapsInCollection(collectionId);

    // Random Map
    if (activeQueue.mapSelectionMode === CS2PUGMapSelectionMode.RANDOM) {
      await DiscordApiRoutes.createNewMessage(interaction.channel_id, 'Randomly selecting a map...');

      await PugQueueUtil.SetupPUG(
        activeQueue,
        maps.map((m) => m.publishedfileid)
      );
    }
    // All pick map
    else if (activeQueue.mapSelectionMode === CS2PUGMapSelectionMode.ALLPICK) {
    // Create map dropdown component
      const dropdownComponent = new StringSelectComponent();

      // TODO: Sort maps alphabetically
      dropdownComponent.min_values = 0;
      dropdownComponent.max_values = 1;
      dropdownComponent.placeholder = 'Select a map';
      dropdownComponent.custom_id = voteDropdownInteractionGuid;
      dropdownComponent.options = maps.map((map) => {
        const label = map.title;
        const value = `id_${map.publishedfileid}`;

        return <SelectOption>{ label, value, default: false };
      });

      const componentWrapper: any = { type: 1, components: [] };
      componentWrapper.components.push(<any>dropdownComponent);

      console.log('Setting the interaction handler');
      await DatabaseWrapper.SetInteractionHandler(
        interaction.member.user.id,
        interaction.guild_id,
        voteDropdownInteractionGuid,
        'PUGMapVote'
      );

      console.log('sending message');
      await DiscordApiRoutes.createNewMessage(
        interaction.channel_id,
        'Vote for the map you would like to play:',
        undefined,
        [componentWrapper]
      );
    } else {
      throw Error('Undefined map selection mode, aborting...');
    }
  }

  private static async LeavePUG (
    interaction: Interaction,
    data: ComponentInteractionData,
    interactionHandler: ComponentInteractionHandler
  ): Promise<void> {
    const activeQueue = await this.GetActiveQueue(interaction, interactionHandler, true);

    if (activeQueue == null) {
      return;
    }

    // If the player is already in the active queue, remove them and quit
    if (activeQueue.userIdsInQueue.includes(interaction.member.user.id)) {
      if (activeQueue.userIdsInQueue[0] === interaction.member.user.id) {
        await DiscordApiRoutes.createFollowupMessage(interaction, {
          content:
                        'The queue leader cannot leave the queue. If you would like to leave, please end the queue'
        });
        return;
      }

      const idx = activeQueue.userIdsInQueue.indexOf(interaction.member.user.id);
      activeQueue.userIdsInQueue.splice(idx, 1);

      await Services.CS2PugQueueSvc.Save(activeQueue);

      const user = await DiscordApiRoutes.getUser(interaction.member.user.id);
      await DiscordApiRoutes.createNewMessage(
        interaction.channel_id,
                `${user.username} has left the queue. x players needed.`
      );
    } else {
      await DiscordApiRoutes.createFollowupMessage(interaction, {
        content: 'You are not in this queue!',
        flags: 64
      });
    }
  }

  private static async PUGMapVote (
    interaction: Interaction,
    data: ComponentInteractionData,
    interactionHandler: ComponentInteractionHandler
  ): Promise<void> {
    // Have to extract the id because of how discord values work
    const selectedMapId = data.values[0].split('_')[1];

    const activeQueue = await this.GetActiveQueue(interaction, interactionHandler, true);

    if (activeQueue == null) {
      return;
    }

    // Verify user is in queue
    if (!activeQueue?.userIdsInQueue.includes(interaction.member.user.id)) {
      await DiscordApiRoutes.createFollowupMessage(interaction, {
        content: 'You are not in this queue!',
        flags: 64
      });
      return;
    }

    // Verify user has not already voted
    if (activeQueue.mapVotes.find((m) => m.userId === interaction.member.user.id) != null) {
      await DiscordApiRoutes.createFollowupMessage(interaction, {
        content: 'You have already voted for a map!',
        flags: 64
      });
      return;
    }

    // Log vote
    activeQueue.mapVotes.push({ userId: interaction.member.user.id, mapVote: selectedMapId });
    await Services.CS2PugQueueSvc.Save(activeQueue);

    // Get map details to print the name out
    const map = await SteamApi.GetCSGOWorkshopMapDetail(selectedMapId);

    await DiscordApiRoutes.createNewMessage(
      activeQueue.activeChannel,
            `${interaction.member.user.username} voted for ${map.title}!`
    );

    // If all votes are counted, flow to next part
    const maxPlayers = PugQueueUtil.GetMaxPlayersForGamemode(activeQueue.gameType);
    const voteCount = activeQueue.mapVotes.length;

    if (maxPlayers === voteCount) {
      await DiscordApiRoutes.createNewMessage(activeQueue.activeChannel, 'All votes are in!');

      await PugQueueUtil.SetupPUG(
        activeQueue,
        activeQueue.mapVotes.map((m) => m.mapVote)
      );
    }
  }

  private static async GetActiveQueue (baseInteraction: Interaction, handler: ComponentInteractionHandler, considerTimeout: boolean): Promise<CS2PugQueue | null> {
    const queues = await Services.CS2PugQueueSvc.GetAllWhere(
      {
        activeChannel: baseInteraction.channel_id,
        leaveQueueButton: { id: handler.id },
        queueEnded: false
      });

    if (queues.length !== 1) {
      await DiscordApiRoutes.createFollowupMessage(baseInteraction, {
        content: 'This queue does not exist or has expired',
        flags: 64
      });

      return null;
    }

    const activeQueue = queues[0];

    if (considerTimeout) {
      // Get time to determine if queue is timed out
      const curTime = new Date();

      if (curTime.getTime() > activeQueue.queueExpirationTime.getTime()) {
        await DiscordApiRoutes.createFollowupMessage(baseInteraction, {
          content: 'This queue is expired',
          flags: 64
        });

        activeQueue.queueEnded = true;
        await Services.CS2PugQueueSvc.Save(activeQueue);

        return null;
      }
    }

    return activeQueue;
  }
}
