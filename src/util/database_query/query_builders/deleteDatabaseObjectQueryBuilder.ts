import { DeleteObjectCommand, DeleteObjectRequest } from '@aws-sdk/client-s3';
import { iDatabaseModel } from '../../../database_models/iDatabaseModel';
import { DatabaseQuery } from '../databaseQuery';
import { StaticDeclarations } from '../../staticDeclarations';

export class DeleteDatabaseObjectQueryBuilder<T extends iDatabaseModel> {
    private object_id: string;

    constructor(object_id: string) {
        this.object_id = object_id;
    }

    public async Execute(type: { new (): T }): Promise<void> {
        let obj = new type();
        const itemKey = obj.BuildKey(this.object_id, '');

        const input: DeleteObjectRequest = {
            Bucket: 'squidbot',
            Key: itemKey,
        };

        const command = new DeleteObjectCommand(input);
        await StaticDeclarations.s3client.send(command);
    }
}
