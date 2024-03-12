import {
    CopyObjectCommand,
    CopyObjectCommandInput,
    DeleteObjectCommand,
    DeleteObjectCommandInput,
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
    public static async ToggleGuildRoleAssignable(guildId: Snowflake, roleId: Snowflake): Promise<string> {
        let obj: any;
        try {
            obj = await DatabaseWrapper.GetBSONObject<DB_GuildSettings>('GuildSettings', guildId);
        } catch (err: any) {
            console.log('error getting object from db, file: ', `GuildSettings/${guildId}.bson`, err);
            obj = {
                assignableRoles: [],
                rconServers: [],
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
                pugging_cs2_enabled: false,
            };
        }

        console.log(obj.assignableRoles);

        let retString = '';
        if (obj.assignableRoles.includes(roleId)) {
            obj.assignableRoles = obj.assignableRoles.filter((r: string) => r !== roleId);
            retString = 'Role set to be unassignable';
        } else {
            obj.assignableRoles.push(roleId);
            retString = 'Role set to be assignable';
        }

        await DatabaseWrapper.PutBSONObject(obj, 'GuildSettings', guildId);
        return retString;
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

            let rconServers: DB_RconServer[] = [];
            for (let i = 1; i < objects.length; i++) {
                const serverEntry = objects[i];

                const rconServer = await DatabaseWrapper.GetBSONObject<DB_RconServer>(
                    'RconServers',
                    serverEntry.split('/')[1].split('.')[0]
                );

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
        const data = await fs.readFile(localFileName, { encoding: 'binary' });
        const buffer = Buffer.from(data, 'binary');

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

    public static async MoveScheduledPlaytestToCompleted(guildId: string, playtestName: string) {
        // Copy Source
        const copyInput: CopyObjectCommandInput = {
            Bucket: bucketName,
            CopySource: `${bucketName}/ScheduledPlaytests/${guildId}/${playtestName}.bson`,
            Key: `CompletedPlaytests/${guildId}/${playtestName}.bson`,
        };

        const copyCommand = new CopyObjectCommand(copyInput);
        const copyResponse = await StaticDeclarations.s3client.send(copyCommand);
        console.log('Copy response:');
        console.log(copyResponse);

        // Delete source (it has been copied)
        const deleteInput: DeleteObjectCommandInput = {
            Bucket: bucketName,
            Key: `ScheduledPlaytests/${guildId}/${playtestName}.bson`,
        };
        const deleteCommand = new DeleteObjectCommand(deleteInput);
        const deleteResponse = await StaticDeclarations.s3client.send(deleteCommand);
        console.log('Delete response');
        console.log(deleteResponse);
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
}
