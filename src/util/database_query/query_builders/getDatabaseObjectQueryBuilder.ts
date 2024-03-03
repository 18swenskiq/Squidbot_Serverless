import { GetObjectCommand, GetObjectRequest } from '@aws-sdk/client-s3';
import { iDatabaseModel } from '../../../database_models/iDatabaseModel';
import { StaticDeclarations } from '../../staticDeclarations';

import { BSON, EJSON, Document } from 'bson';
import { DatabaseQuery } from '../databaseQuery';

export class GetDatabaseObjectQueryBuilder<T extends iDatabaseModel> {
    private object_id: string;
    private createIfNotExist: boolean;

    constructor(object_id: string) {
        this.object_id = object_id;
        this.createIfNotExist = false;
    }

    public CreateIfNotExist(): GetDatabaseObjectQueryBuilder<T> {
        this.createIfNotExist = true;
        return this;
    }

    public async Execute(type: { new (): T }): Promise<T | null> {
        // Get old or empty object if doesn't exist
        return await this.GetExistingObject(type);
    }

    private async GetExistingObject(type: { new (): T }): Promise<T | null> {
        const blank_obj = new type();
        const key = blank_obj.BuildKey(this.object_id);

        const input: GetObjectRequest = {
            Bucket: 'squidbot',
            Key: key,
        };

        try {
            const command = new GetObjectCommand(input);
            const response = await StaticDeclarations.s3client.send(command);
            const respBytes = await response.Body?.transformToByteArray();

            if (respBytes === undefined) {
                throw new Error('Found object but it had no bytes :(');
            }

            const doc: Document = BSON.deserialize(respBytes);
            const obj = JSON.parse(EJSON.stringify(doc));

            const castedObj = obj as T;

            // Fix up all date objects
            for (const key in castedObj) {
                if ('$date' in (castedObj[key] as any)) {
                    const dateStringVal = (castedObj[key] as any)['$date'];
                    const newDate = new Date(dateStringVal);
                    (castedObj[key] as any) = newDate;
                }
            }

            return castedObj;
        } catch {
            if (this.createIfNotExist) {
                console.log(
                    `Object with key ${key} was not found in database for type ${typeof blank_obj}. It will be newly created.`
                );
                return await new DatabaseQuery().CreateNewObject<T>(key).Execute(type);
            }

            console.log(
                `Object with key ${key} was not found in database for type ${typeof blank_obj}. It will not be created`
            );
            return null;
        }
    }
}
