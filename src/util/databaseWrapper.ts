import { GetObjectCommand, GetObjectRequest, PutObjectCommand, PutObjectCommandInput } from '@aws-sdk/client-s3';
import { BSON, EJSON, Document } from 'bson';
import { UserSettings } from '../database_models/userSettings';
import { Snowflake } from '../discord_api/snowflake';
import { StaticDeclarations } from './staticDeclarations';

const bucketName = 'squidbot';
type ObjectDirectory = 'UserSettings' | 'GuildSettings';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export abstract class DatabaseWrapper {
  public static async SetUserTimeString (userId: Snowflake, timeString: string): Promise<void> {
    const obj = await DatabaseWrapper.GetBSONObject<UserSettings>('UserSettings', userId);

    console.log('Successfully got');
    if (Object.keys(obj).length === 0) {
      console.log("Object wasn't found");
    }

    console.log('Putting');
    obj.timeZoneName = timeString;

    await DatabaseWrapper.PutBSONObject(obj, 'UserSettings', userId);
  }

  private static async GetBSONObject<T>(dir: ObjectDirectory, key: string): Promise<T> {
    console.log('getting BSON object');
    const itemKey = `${dir}/${key}.bson`;

    const input: GetObjectRequest = {
      Bucket: bucketName,
      Key: itemKey
    }

    const command = new GetObjectCommand(input);

    console.log('command', command);
    try {
      const response = await StaticDeclarations.s3client.send(command);
      console.log('first response', response);
      const respBytes = await response.Body?.transformToByteArray();

      if (respBytes === undefined) {
        throw Error('thing was undefined');
      }

      const doc: Document = BSON.deserialize(respBytes);
      const obj = JSON.parse(EJSON.stringify(doc));

      return obj as T;
    } catch (err: any) {
      console.log(err);
      return <T>{};
    }
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
    try {
      const response = await StaticDeclarations.s3client.send(command);
      console.log('response', response);
      return true;
    } catch (error: any) {
      console.log(error);
      return false;
    }
  }
}
