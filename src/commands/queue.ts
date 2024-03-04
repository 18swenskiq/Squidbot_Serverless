import { DB_CS2PugQueue } from '../database_models/cs2PugQueue';
import { DB_UserSettings } from '../database_models/userSettings';
import { type CommandDescription } from '../discord_api/command';
import { CommandResult } from '../discord_api/commandResult';
import { type Interaction } from '../discord_api/interaction';
import { SlashCommandBuilder } from '../discord_api/slash_command_builder';
import { DatabaseQuery } from '../util/database_query/databaseQuery';
import { FTPUtil } from '../util/ftpUtil';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Join the current queue in the channel (will error if no queue is present)'),
    async execute(interaction: Interaction): Promise<CommandResult> {
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
            return new CommandResult('There is not currently an active queue in this channel!', false, false);
        }

        // Ensure the player isn't in another queue already
        if (queues.find((q) => q.usersInQueue.includes(interaction.member.user.id))) {
            // If the player is already in the active queue, remove them and quit
            if (activeQueue.usersInQueue.includes(interaction.member.user.id)) {
                await new DatabaseQuery()
                    .ModifyObject<DB_CS2PugQueue>(`${interaction.guild_id}/${activeQueue.id}`)
                    .RemoveFromPropertyArray('usersInQueue', [interaction.member.user.id])
                    .Execute(DB_CS2PugQueue);
                return new CommandResult('Removed from queue!', false, false);
            }

            return new CommandResult('You cannot join a queue while you are already in an active queue!', false, false);
        }

        // Ensure the player is steamlinked
        const userSettings = await new DatabaseQuery()
            .GetObject<DB_UserSettings>(interaction.member.user.id)
            .Execute(DB_UserSettings);

        if (userSettings === null || !userSettings.steamLink) {
            return new CommandResult('You must link your steam id with `/link` to queue', false, false);
        }

        // Add player to queue
        await new DatabaseQuery()
            .ModifyObject<DB_CS2PugQueue>(`${interaction.guild_id}/${activeQueue.id}`)
            .AddToPropertyArray('usersInQueue', [interaction.member.user.id])
            .Execute(DB_CS2PugQueue);

        return new CommandResult('Added you to queue, more to come later', false, false);

        // If queue is full, continue process
    },
} as CommandDescription;
