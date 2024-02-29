import { ListObjectsCommand, ListObjectsCommandInput } from '@aws-sdk/client-s3';
import { iDatabaseModel } from '../../../database_models/iDatabaseModel';
import { StaticDeclarations } from '../../staticDeclarations';

export class ListDatabaseObjectsQueryBuilder<T extends iDatabaseModel> {
    public async Execute(type: { new (): T }): Promise<string[]> {
        let prefix = new type().GetTopLevelKey();

        console.log('listing with prefix');
        console.log(prefix);
        // TODO: This can only return 1000 objects, consider chunking?
        const input: ListObjectsCommandInput = {
            Bucket: 'squidbot',
            MaxKeys: 1000,
            Prefix: prefix,
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
}
