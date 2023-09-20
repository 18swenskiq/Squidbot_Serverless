import { GetObjectCommand, GetObjectRequest, ListObjectsCommand, ListObjectsCommandInput, PutObjectCommand, PutObjectCommandInput } from '@aws-sdk/client-s3';
import { BSON, EJSON, Document } from 'bson';
import { DB_UserSettings } from '../database_models/userSettings';
import { Snowflake } from '../discord_api/snowflake';
import { StaticDeclarations } from './staticDeclarations';
import { DB_GuildSettings } from '../database_models/guildSettings';
import { Guid } from './guid';
import { DB_ComponentInteractionHandler, HandlableComponentInteractionType } from '../database_models/interactionHandler';
import { GameServer } from './gameServer';

const bucketName = 'squidbot';
type ObjectDirectory = 'UserSettings' | 'GuildSettings' | 'InteractableComponents';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export abstract class DatabaseWrapper {
  public static async SetUserTimeString (userId: Snowflake, timeString: string): Promise<void> {
    let obj: DB_UserSettings;
    try {
      obj = await DatabaseWrapper.GetBSONObject<DB_UserSettings>('UserSettings', userId);
    } catch (error) {
      console.log("user wasn't found in DB, creating...");
      obj = <DB_UserSettings>{ timeZoneName: timeString };
    }

    await DatabaseWrapper.PutBSONObject(obj, 'UserSettings', userId);
  }

  public static async ToggleGuildRoleAssignable (guildId: Snowflake, roleId: Snowflake): Promise<string> {
    let obj: DB_GuildSettings;
    try {
      obj = await DatabaseWrapper.GetBSONObject<DB_GuildSettings>('GuildSettings', guildId);
    } catch (err: any) {
      console.log('error getting object from db, file: ', `GuildSettings/${guildId}.bson`, err);
      obj = { assignableRoles: [], gameServers: [] };
    }

    console.log(obj.assignableRoles);

    let retString = '';
    if (obj.assignableRoles.includes(roleId)) {
      obj.assignableRoles = obj.assignableRoles.filter(r => r !== roleId);
      retString = 'Role set to be unassignable';
    } else {
      obj.assignableRoles.push(roleId);
      retString = 'Role set to be assignable';
    }

    await DatabaseWrapper.PutBSONObject(obj, 'GuildSettings', guildId);
    return retString;
  }

  public static async AddGameServer (guildId: Snowflake, newServer: GameServer): Promise<string> {
    let obj: DB_GuildSettings;
    try {
      obj = await DatabaseWrapper.GetGuildSettings(guildId);
      obj.gameServers.push(newServer);
      await DatabaseWrapper.PutBSONObject(obj, 'GuildSettings', guildId);
      return `Added Game Server \`${newServer.nickname}\``;
    } catch (err: any) {
      console.log('error adding game server to guild. ', `GuildSettings/${guildId}.bson`, err);
      return "Failed to add game server";
    }
  }

  public static async GetGuildRolesAssignable (guildId: Snowflake): Promise<Snowflake[]> {
    try {
      const obj = await DatabaseWrapper.GetGuildSettings(guildId);
      return obj.assignableRoles;
    } catch (err: any) {
      return [];
    }
  }

  public static async GetGameServers (guildId: Snowflake): Promise<GameServer[]> {
    try {
      const obj = await DatabaseWrapper.GetGuildSettings(guildId);
      return obj.gameServers;
    } catch (err: any) {
      return [];
    }
  }

  public static async GetUserSettings (userIds: Snowflake[]): Promise<Record<Snowflake, DB_UserSettings>> {
    let listObj = await DatabaseWrapper.ListObjects('UserSettings');

    listObj.shift()
    listObj = listObj.map(o => o.split('/')[1].replace('.bson', ''));

    const validUserIds = listObj.filter(l => userIds.includes(l));

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

  public static async SetInteractionHandler (creator: Snowflake, guildId: Snowflake, handlerId: Guid, handleType: HandlableComponentInteractionType, handled: number = 0): Promise<void> {
    const obj = <DB_ComponentInteractionHandler>{ type: handleType, creationTimeEpoch: Date.now(), createdBy: creator, timesHandled: handled };

    const keyName = `${guildId}/${handlerId}`;

    await DatabaseWrapper.PutBSONObject(obj, 'InteractableComponents', keyName);
  }

  public static async GetInteractionHandler (guildId: Snowflake, handlerId: Guid): Promise<DB_ComponentInteractionHandler> {
    const keyName = `${guildId}/${handlerId}`;

    return await DatabaseWrapper.GetBSONObject<DB_ComponentInteractionHandler>('InteractableComponents', keyName);
  }

  private static async ListObjects (dir: ObjectDirectory): Promise<string[]> {
    const input: ListObjectsCommandInput = {
      Bucket: bucketName,
      MaxKeys: 1000,
      Prefix: dir
    }

    const command = new ListObjectsCommand(input);
    const response = await StaticDeclarations.s3client.send(command);

    if (response.Contents === undefined) {
      console.log('response was error!');
      return [];
    }

    const contents = response.Contents === undefined ? [] : response.Contents;

    return contents.map(c => c.Key) as string[];
  }

  private static async GetBSONObject<T>(dir: ObjectDirectory, key: string): Promise<T> {
    const itemKey = `${dir}/${key}.bson`;

    const input: GetObjectRequest = {
      Bucket: bucketName,
      Key: itemKey
    }

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

  private static async PutBSONObject (obj: any, dir: ObjectDirectory, key: string): Promise<boolean> {
    const itemKey = `${dir}/${key}.bson`;

    const binObj = BSON.serialize(obj);

    const input: PutObjectCommandInput = {
      Body: binObj,
      Bucket: bucketName,
      Key: itemKey
    }

    const command = new PutObjectCommand(input);
    await StaticDeclarations.s3client.send(command);
    return true;
  }

  private static async GetGuildSettings (guildId: Snowflake): Promise<DB_GuildSettings> {
    const obj = await DatabaseWrapper.GetBSONObject<DB_GuildSettings>('GuildSettings', guildId);
    return obj;
  }
}
