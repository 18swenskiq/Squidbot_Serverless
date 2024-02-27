import { iDatabaseModel } from '../../../database_models/iDatabaseModel';
import { DatabaseQuery } from '../databaseQuery';

export class CreateNewDatabaseObjectQueryBuilder<T extends iDatabaseModel> {
    private new_obj = <T>{};

    private object_id: string;

    constructor(object_id: string) {
        this.object_id = object_id;
    }

    public SetProperty<K extends keyof T>(property: K, value: T[K]): CreateNewDatabaseObjectQueryBuilder<T> {
        this.new_obj[property] = value;
        return this;
    }

    public async Execute(type: { new (): T }): Promise<T> {
        let obj = new type();

        // Modify object
        for (const key in this.new_obj) {
            obj[key] = this.new_obj[key];
        }

        // Set object
        await new DatabaseQuery().PutObject<T>(this.object_id, obj).Execute(type);
        return obj;
    }
}
