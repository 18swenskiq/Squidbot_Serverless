import { GetObjectCommand, GetObjectRequest } from '@aws-sdk/client-s3';
import { iDatabaseModel } from '../../../database_models/iDatabaseModel';
import { StaticDeclarations } from '../../staticDeclarations';

import { BSON, EJSON, Document } from 'bson';

export class GetDatabaseObjectQueryBuilder<T extends iDatabaseModel> {
    private object_id: string;

    constructor(object_id: string) {
        this.object_id = object_id;
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

        const command = new GetObjectCommand(input);

        const response = await StaticDeclarations.s3client.send(command);
        const respBytes = await response.Body?.transformToByteArray();

        if (respBytes === undefined) {
            console.log(`Object with key ${key} was not found in database for type ${typeof blank_obj}`);
            return null;
        }

        const doc: Document = BSON.deserialize(respBytes);
        const obj = JSON.parse(EJSON.stringify(doc));

        return obj as T;
    }
}
