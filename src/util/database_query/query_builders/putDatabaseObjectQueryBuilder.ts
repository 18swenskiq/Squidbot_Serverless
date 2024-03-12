import { GetObjectCommand, GetObjectRequest, PutObjectCommand, PutObjectCommandInput } from '@aws-sdk/client-s3';
import { iDatabaseModel } from '../../../database_models/iDatabaseModel';
import { StaticDeclarations } from '../../staticDeclarations';

import { BSON, EJSON, Document } from 'bson';
import { DatabaseQuery } from '../databaseQuery';

export class PutDatabaseObjectQueryBuilder<T extends iDatabaseModel> {
    private object_id: string;
    private object_to_put: T;
    private error_if_object_exists: boolean;

    constructor(object_id: string, put_object: T) {
        this.object_id = object_id;
        this.object_to_put = put_object;
        this.error_if_object_exists = false;
    }

    public ErrorIfObjectExists(): PutDatabaseObjectQueryBuilder<T> {
        this.error_if_object_exists = true;
        return this;
    }

    public async Execute(type: { new (): T }): Promise<void> {
        // We want to throw an error if the object exists (because we don't expect it to)
        // In this case just run a GET and throw if it returns truthy
        if (this.error_if_object_exists) {
            var query = new DatabaseQuery().GetObject<T>(this.object_id).Execute(type);

            if (!query) {
                throw new Error('Could not PUT object because it already exists (ERROR_IF_OBJECT_EXISTS === true)');
            }
        }

        const blank_obj = new type();
        const key = blank_obj.BuildKey(this.object_id, '');

        const binObj = BSON.serialize(this.object_to_put);

        const input: PutObjectCommandInput = {
            Body: binObj,
            Bucket: 'squidbot',
            Key: key,
        };

        const command = new PutObjectCommand(input);
        await StaticDeclarations.s3client.send(command);
    }
}
