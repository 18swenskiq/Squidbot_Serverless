import { InvokeCommand, InvokeCommandInput, LambdaClient } from '@aws-sdk/client-lambda';
import { DB_ScheduledPlaytest } from '../database_models/scheduledPlaytest';
import { DB_UserSettings } from '../database_models/userSettings';
import { type CommandDescription } from '../discord_api/command';
import { CommandResult } from '../discord_api/commandResult';
import { InteractionData, type Interaction } from '../discord_api/interaction';
import { SlashCommandBuilder } from '../discord_api/slash_command_builder';
import { SteamApi } from '../steam_api/steamApi';
import { DatabaseQuery } from '../util/database_query/databaseQuery';
import { DiscordApiRoutes } from '../discord_api/apiRoutes';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reparse_demos')
        .setDescription('Reparse all demos via the lambda')
        .setAllowedUsersOnly(['66318815247466496']),
    async execute(interaction: Interaction): Promise<CommandResult> {
        const interactionData = <InteractionData>interaction.data;

        let completedPlaytests = await new DatabaseQuery()
            .ListObjects<DB_ScheduledPlaytest>()
            .ModifyTopLevelKey('CompletedPlaytests')
            .Execute(DB_ScheduledPlaytest);

        // Throw out all garbage things (folders)
        completedPlaytests = completedPlaytests.filter((c) => c.endsWith('.bson'));

        const allPlaytestObjects: DB_ScheduledPlaytest[] = [];

        // Get all completed playtests
        for (let i = 0; i < completedPlaytests.length; i++) {
            let rootName = completedPlaytests[i].split('/').splice(2, 1).join('/');
            let completedObjectName = completedPlaytests[i].replace('.bson', '').replace('CompletedPlaytests/', '');
            const playtest = await new DatabaseQuery()
                .GetObject<DB_ScheduledPlaytest>(completedObjectName)
                .ModifyRoot(rootName)
                .Execute(DB_ScheduledPlaytest);

            if (playtest === null) {
                throw new Error(
                    `Error getting object. CompletedObjectName = '${completedObjectName}' | ModifiedRoot = '${rootName}'`
                );
            }

            allPlaytestObjects.push(playtest);
        }

        // Sort all playtests by date so we parse them in order
        allPlaytestObjects.sort((a, b) => {
            return b.playtestTime.getTime() - a.playtestTime.getTime();
        });

        for (let i = 0; i < allPlaytestObjects.length; i++) {
            const thisPlaytest = allPlaytestObjects[i];

            let lambdaPlaytestType: number;
            switch (thisPlaytest.playtestType) {
                case '2v2':
                    lambdaPlaytestType = 0;
                    break;
                case '5v5':
                    lambdaPlaytestType = 1;
                    break;
                case '10v10':
                    lambdaPlaytestType = 2;
                    break;
                default:
                    throw new Error('Unexpected playtest type');
            }

            // Hack to get the guildid of this
            const thisKey = completedPlaytests.find((c) => c.includes(thisPlaytest.Id));
            if (thisKey === undefined) {
                throw new Error(
                    `Unable to re-find playtest (how did you do this?) | Could not re-find ${thisPlaytest.Id} in original list`
                );
            }
            const guildId = thisKey.split('/')[1];

            const lambdaParameters = {
                DemoName: thisPlaytest.Id,
                GuildId: guildId,
                DemoContext: 0,
                PlaytestType: lambdaPlaytestType,
            };

            const lambdaParams: InvokeCommandInput = {
                FunctionName: 'squidbot_demo_parser',
                InvocationType: 'RequestResponse',
                LogType: 'Tail',
                Payload: JSON.stringify(lambdaParameters),
            };

            const client = new LambdaClient();
            const fetchCommand = new InvokeCommand(lambdaParams);

            const response = await client.send(fetchCommand);
            await DiscordApiRoutes.createNewMessage(
                interaction.channel_id,
                `Parsing ${thisPlaytest.Id}, response from Lambda: ${response}`
            );
            console.log('lambda response:');
            console.log(response);
        }

        // TODO: Clear out old ELO database

        // TODO: Include PUG demos in elo calculations

        return new CommandResult('Re-ran all demos', false, false);
    },
} as CommandDescription;
