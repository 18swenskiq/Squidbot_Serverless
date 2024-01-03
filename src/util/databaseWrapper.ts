import {
    DeleteObjectCommand,
    DeleteObjectRequest,
    GetObjectCommand,
    GetObjectRequest,
    ListObjectsCommand,
    ListObjectsCommandInput,
    PutObjectCommand,
    PutObjectCommandInput,
} from '@aws-sdk/client-s3';
import { BSON, EJSON, Document } from 'bson';
import { DB_UserSettings } from '../database_models/userSettings';
import { Snowflake } from '../discord_api/snowflake';
import { StaticDeclarations } from './staticDeclarations';
import { DB_GuildSettings } from '../database_models/guildSettings';
import { Guid } from './guid';
import {
    DB_ComponentInteractionHandler,
    HandlableComponentInteractionType,
} from '../database_models/interactionHandler';
import { DB_RconServer } from '../database_models/rconServer';
import { DB_PlaytestRequest } from '../database_models/playtestRequest';
import { DB_ScheduledPlaytest } from '../database_models/scheduledPlaytest';
import { promises as fs } from 'fs';

const bucketName = 'squidbot';
type ObjectDirectory =
    | 'UserSettings'
    | 'GuildSettings'
    | 'InteractableComponents'
    | 'RconServers'
    | 'PlaytestRequests'
    | 'ScheduledPlaytests'
    | 'PlaytestConfigs';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export abstract class DatabaseWrapper {
    public static async SetUserTimeString(userId: Snowflake, timeString: string): Promise<void> {
        let obj: DB_UserSettings;
        try {
            obj = await DatabaseWrapper.GetBSONObject<DB_UserSettings>('UserSettings', userId);
        } catch (error) {
            console.log("user wasn't found in DB, creating...");
            obj = { timeZoneName: timeString, activeRconServer: {} };
        }

        await DatabaseWrapper.PutBSONObject(obj, 'UserSettings', userId);
    }

    public static async ToggleGuildRoleAssignable(guildId: Snowflake, roleId: Snowflake): Promise<string> {
        let obj: DB_GuildSettings;
        try {
            obj = await DatabaseWrapper.GetBSONObject<DB_GuildSettings>('GuildSettings', guildId);
        } catch (err: any) {
            console.log('error getting object from db, file: ', `GuildSettings/${guildId}.bson`, err);
            obj = {
                assignableRoles: [],
                rconServers: [],
                gameServers: [],
                playtesting: {
                    cs2: {
                        playtestChannel: '',
                        announceChannel: '',
                        enabled: false,
                        requestChannel: '',
                        competitiveChannel: '',
                    },
                },
                activePlaytest: null,
            };
        }

        console.log(obj.assignableRoles);

        let retString = '';
        if (obj.assignableRoles.includes(roleId)) {
            obj.assignableRoles = obj.assignableRoles.filter((r) => r !== roleId);
            retString = 'Role set to be unassignable';
        } else {
            obj.assignableRoles.push(roleId);
            retString = 'Role set to be assignable';
        }

        await DatabaseWrapper.PutBSONObject(obj, 'GuildSettings', guildId);
        return retString;
    }

    public static async SetGuildActivePlaytest(guildId: Snowflake, playtestId: Guid | null) {
        const obj = await DatabaseWrapper.GetBSONObject<DB_GuildSettings>('GuildSettings', guildId);
        if (obj.activePlaytest) {
            throw Error('Guild already has active playtest');
        }

        obj.activePlaytest = playtestId;
        await DatabaseWrapper.PutBSONObject(obj, 'GuildSettings', guildId);
    }

    public static async EnableCS2Playtesting(
        guildId: Snowflake,
        requestChannel: Snowflake,
        announceChannel: Snowflake,
        playtestChannel: Snowflake,
        competitiveChannel: Snowflake
    ): Promise<void> {
        const obj = await DatabaseWrapper.GetBSONObject<DB_GuildSettings>('GuildSettings', guildId);
        obj.playtesting = {
            cs2: {
                enabled: true,
                requestChannel: requestChannel,
                announceChannel: announceChannel,
                playtestChannel: playtestChannel,
                competitiveChannel: competitiveChannel,
            },
        };
        await DatabaseWrapper.PutBSONObject(obj, 'GuildSettings', guildId);
    }

    public static async AddGameServer(newServer: DB_RconServer): Promise<string> {
        let obj: DB_GuildSettings;
        try {
            await DatabaseWrapper.PutBSONObject(newServer, 'RconServers', newServer.id);

            obj = await DatabaseWrapper.GetGuildSettings(newServer.guildId);

            if (!obj.rconServers) {
                obj.rconServers = [];
            }

            obj.rconServers.push(newServer.id);
            await DatabaseWrapper.PutBSONObject(obj, 'GuildSettings', newServer.guildId);
            return `Added Game Server \`${newServer.nickname}\``;
        } catch (err: any) {
            console.log('error adding game server to guild', err);
            return 'Failed to add game server';
        }
    }

    public static async GetGuildRolesAssignable(guildId: Snowflake): Promise<Snowflake[]> {
        try {
            const obj = await DatabaseWrapper.GetGuildSettings(guildId);
            return obj.assignableRoles;
        } catch (err: any) {
            return [];
        }
    }

    public static async GetActiveRconServer(userId: Snowflake, guildId: Snowflake): Promise<DB_RconServer> {
        const user = await DatabaseWrapper.GetUserSettings_Single(userId);

        console.log('user', user);

        if (user.activeRconServer && guildId in user.activeRconServer) {
            try {
                const server = await DatabaseWrapper.GetBSONObject<DB_RconServer>(
                    'RconServers',
                    user.activeRconServer[guildId]
                );
                return server;
            } catch {
                return <DB_RconServer>{};
            }
        }

        return <DB_RconServer>{};
    }

    public static async SetActiveRconServer(userId: Snowflake, guildId: Snowflake, rconServerId: Guid): Promise<void> {
        try {
            const obj = await DatabaseWrapper.GetUserSettings_Single(userId);
            obj.activeRconServer[guildId] = rconServerId;

            await DatabaseWrapper.PutBSONObject(obj, 'UserSettings', userId);
        } catch (err: any) {
            return;
        }
    }

    public static async GetGameServers(guildId: Snowflake): Promise<DB_RconServer[]> {
        try {
            const objects = await DatabaseWrapper.ListObjects('RconServers');
            console.log('the objects');
            console.log(objects);
            let rconServers: DB_RconServer[] = [];
            for (let i = 1; i < objects.length; i++) {
                const serverEntry = objects[i];
                console.log('server entry');
                console.log(serverEntry);
                const rconServer = await DatabaseWrapper.GetBSONObject<DB_RconServer>(
                    'RconServers',
                    serverEntry.split('/')[1].split('.')[0]
                );
                console.log('rcon server:');
                console.log(rconServer);
                if (rconServer.guildId === guildId) {
                    rconServers.push(rconServer);
                }
            }

            return rconServers ?? [];
        } catch (err: any) {
            return [];
        }
    }

    public static async GetUserSettings_Single(userId: Snowflake): Promise<DB_UserSettings> {
        try {
            const obj = await DatabaseWrapper.GetBSONObject<DB_UserSettings>('UserSettings', userId);

            if (!obj.activeRconServer) {
                obj.activeRconServer = {};
            }

            return obj;
        } catch (err: any) {
            return <DB_UserSettings>{ activeRconServer: {} };
        }
    }

    public static async GetUserSettings(userIds: Snowflake[]): Promise<Record<Snowflake, DB_UserSettings>> {
        let listObj = await DatabaseWrapper.ListObjects('UserSettings');
        listObj.shift();
        listObj = listObj.map((o) => o.split('/')[1].replace('.bson', ''));

        const validUserIds = listObj.filter((l) => userIds.includes(l));

        const retObj: Record<Snowflake, DB_UserSettings> = {};

        for (let i = 0; i < validUserIds.length; i++) {
            const id = validUserIds[i];
            const res = await DatabaseWrapper.GetBSONObject<DB_UserSettings>('UserSettings', id);

            if (Object.keys(res).length > 0) {
                retObj[id] = res;
            }
        }

        return retObj;
    }

    public static async CreateCS2PlaytestRequest(guildId: Snowflake, requestBody: DB_PlaytestRequest): Promise<void> {
        const keyName = `${guildId}/${requestBody.Id}`;

        await DatabaseWrapper.PutBSONObject(requestBody, 'PlaytestRequests', keyName);
    }

    public static async GetPlaytestRequest(guildId: Snowflake, playtestId: Guid): Promise<DB_PlaytestRequest> {
        const res = await DatabaseWrapper.GetBSONObject<DB_PlaytestRequest>(
            `PlaytestRequests`,
            `${guildId}/${playtestId}`
        );
        return res;
    }

    public static async DeletePlaytestRequest(guildId: Snowflake, playtestId: Guid): Promise<void> {
        await DatabaseWrapper.DeleteBSONObject('PlaytestRequests', `${guildId}/${playtestId}`);
    }

    public static async GetPlaytestRequests(guildId: Snowflake): Promise<Record<Snowflake, DB_PlaytestRequest>> {
        let objects = await DatabaseWrapper.ListObjects(`PlaytestRequests`);

        objects = objects.filter((o) => o.endsWith('bson'));
        objects = objects.map((o) => o.replace('.bson', ''));
        objects = objects.filter((o) => o.includes(guildId));
        objects = objects.map((o) => o.replace('PlaytestRequests/', ''));

        const retObj: Record<Snowflake, DB_PlaytestRequest> = {};

        for (let i = 0; i < objects.length; i++) {
            const id = objects[i];
            const res = await DatabaseWrapper.GetBSONObject<DB_PlaytestRequest>(`PlaytestRequests`, id);

            if (Object.keys(res).length > 0) {
                retObj[id] = res;
            }
        }

        return retObj;
    }

    public static async CreateScheduledPlaytest(guildId: Snowflake, requestBody: DB_ScheduledPlaytest): Promise<void> {
        const keyName = `${guildId}/${requestBody.Id}`;

        await DatabaseWrapper.PutBSONObject(requestBody, 'ScheduledPlaytests', keyName);
    }

    public static async GetScheduledPlaytest(guildId: Snowflake, playtestId: Guid): Promise<DB_ScheduledPlaytest> {
        const res = await DatabaseWrapper.GetBSONObject<DB_ScheduledPlaytest>(
            'ScheduledPlaytests',
            `${guildId}/${playtestId}`
        );
        return res;
    }

    public static async DeleteScheduledPlaytest(guildId: Snowflake, playtestId: Guid): Promise<void> {
        await DatabaseWrapper.DeleteBSONObject('ScheduledPlaytests', `${guildId}/${playtestId}`);
    }

    public static async SetInteractionHandler(
        creator: Snowflake,
        guildId: Snowflake,
        handlerId: Guid,
        handleType: HandlableComponentInteractionType,
        handled: number = 0
    ): Promise<void> {
        const obj = <DB_ComponentInteractionHandler>{
            type: handleType,
            creationTimeEpoch: Date.now(),
            createdBy: creator,
            timesHandled: handled,
        };

        const keyName = `${guildId}/${handlerId}`;

        await DatabaseWrapper.PutBSONObject(obj, 'InteractableComponents', keyName);
    }

    public static async GetInteractionHandler(
        guildId: Snowflake,
        handlerId: Guid
    ): Promise<DB_ComponentInteractionHandler> {
        const keyName = `${guildId}/${handlerId}`;
        return await DatabaseWrapper.GetBSONObject<DB_ComponentInteractionHandler>('InteractableComponents', keyName);
    }

    public static async ListScheduledPlaytests(guildId: Snowflake): Promise<string[]> {
        const input: ListObjectsCommandInput = {
            Bucket: bucketName,
            MaxKeys: 1000,
            Prefix: `ScheduledPlaytests/${guildId}`,
        };

        const command = new ListObjectsCommand(input);
        const response = await StaticDeclarations.s3client.send(command);

        if (response.Contents === undefined) {
            console.log('response was error!');
            return [];
        }

        const contents = response.Contents === undefined ? [] : response.Contents;

        return contents.map((c) => c.Key) as string[];
    }

    public static async GetPlaytestConfig(configName: string): Promise<string | null> {
        const itemKey = `PlaytestConfigs/${configName}.cfg`;

        const input: GetObjectRequest = {
            Bucket: bucketName,
            Key: itemKey,
        };

        const command = new GetObjectCommand(input);

        const response = await StaticDeclarations.s3client.send(command);
        const respBytes = await response.Body?.transformToString('utf-8');

        if (respBytes === undefined) {
            return null;
        }
        return respBytes;
    }

    public static async UploadFileToS3(localFileName: string, s3Key: string): Promise<string> {
        const data = await fs.readFile(localFileName, 'binary');
        const buffer = Buffer.from(data);

        var input: PutObjectCommandInput = {
            Bucket: bucketName,
            Key: s3Key,
            Body: buffer,
            ACL: 'public-read',
        };

        const command = new PutObjectCommand(input);
        const response = await StaticDeclarations.s3client.send(command);
        console.log('Upload File response');
        console.log(response);
        return `https://squidbot.s3.us-east-2.amazonaws.com/${s3Key}`;
    }

    private static async ListObjects(dir: ObjectDirectory): Promise<string[]> {
        const input: ListObjectsCommandInput = {
            Bucket: bucketName,
            MaxKeys: 1000,
            Prefix: dir,
        };

        const command = new ListObjectsCommand(input);
        const response = await StaticDeclarations.s3client.send(command);

        if (response.Contents === undefined) {
            console.log('response was error!');
            return [];
        }

        const contents = response.Contents === undefined ? [] : response.Contents;

        return contents.map((c) => c.Key) as string[];
    }

    private static async GetBSONObject<T>(dir: ObjectDirectory, key: string): Promise<T> {
        const itemKey = `${dir}/${key}.bson`;

        const input: GetObjectRequest = {
            Bucket: bucketName,
            Key: itemKey,
        };

        const command = new GetObjectCommand(input);

        const response = await StaticDeclarations.s3client.send(command);
        const respBytes = await response.Body?.transformToByteArray();

        if (respBytes === undefined) {
            throw Error('thing was undefined');
        }

        const doc: Document = BSON.deserialize(respBytes);
        const obj = JSON.parse(EJSON.stringify(doc));

        return obj as T;
    }

    private static async DeleteBSONObject(dir: ObjectDirectory, key: string): Promise<void> {
        const itemKey = `${dir}/${key}.bson`;

        const input: DeleteObjectRequest = {
            Bucket: bucketName,
            Key: itemKey,
        };

        const command = new DeleteObjectCommand(input);

        const response = await StaticDeclarations.s3client.send(command);

        console.log(response);
    }

    private static async PutBSONObject(obj: any, dir: ObjectDirectory, key: string): Promise<boolean> {
        const itemKey = `${dir}/${key}.bson`;

        const binObj = BSON.serialize(obj);

        const input: PutObjectCommandInput = {
            Body: binObj,
            Bucket: bucketName,
            Key: itemKey,
        };

        const command = new PutObjectCommand(input);
        await StaticDeclarations.s3client.send(command);
        return true;
    }

    public static async GetGuildSettings(guildId: Snowflake): Promise<DB_GuildSettings> {
        const obj = await DatabaseWrapper.GetBSONObject<DB_GuildSettings>('GuildSettings', guildId);
        return obj;
    }
}
