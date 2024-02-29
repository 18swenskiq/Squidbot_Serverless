import { iDatabaseModel } from '../../../database_models/iDatabaseModel';
import { DatabaseQuery } from '../databaseQuery';

export class GetDatabaseObjectsQueryBuilder<T extends iDatabaseModel> {
    private modify_obj = <T>{};

    public WherePropertyEquals<K extends keyof T>(property: K, value: T[K]): GetDatabaseObjectsQueryBuilder<T> {
        this.modify_obj[property] = value;
        return this;
    }

    public async Execute(type: { new (): T }): Promise<T[]> {
        // List objects
        const list = await new DatabaseQuery().ListObjects<T>().Execute(type);
        console.log('list');
        console.log(list);

        // Get each object
        let awsObjects: T[] = [];

        // The first object is always the folder
        for (let i = 1; i < list.length; i++) {
            console.log('List index ' + i);
            console.log(list[i]);
            let s3itemKey = list[i];
            let s3Item = await new DatabaseQuery()
                .GetObject<T>(s3itemKey.split('/').splice(0, 1).join('/').replace('.bson', ''))
                .Execute(type);

            if (s3Item === null) {
                throw new Error(`Could not get object from database that appeared in list. [${s3itemKey} not `);
            }

            awsObjects.push(s3Item);
        }

        // Filter based on properties
        for (const key in this.modify_obj) {
            awsObjects = awsObjects.filter((f) => f[key] === this.modify_obj[key]);
        }

        return awsObjects;
    }
}
