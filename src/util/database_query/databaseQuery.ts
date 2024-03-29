import { iDatabaseModel } from '../../database_models/iDatabaseModel';
import { CreateNewDatabaseObjectQueryBuilder } from './query_builders/createNewDatabaseObjectQueryBuilder';
import { DeleteDatabaseObjectQueryBuilder } from './query_builders/deleteDatabaseObjectQueryBuilder';
import { GetDatabaseObjectQueryBuilder } from './query_builders/getDatabaseObjectQueryBuilder';
import { GetDatabaseObjectsQueryBuilder } from './query_builders/getDatabaseObjectsQueryBuilder';
import { ListDatabaseObjectsQueryBuilder } from './query_builders/listDatabaseObjectsQueryBuilder';
import { ModifyDatabaseObjectQueryBuilder } from './query_builders/modifyDatabaseObjectQueryBuilder';
import { PutDatabaseObjectQueryBuilder } from './query_builders/putDatabaseObjectQueryBuilder';

export class DatabaseQuery {
    public ListObjects<T extends iDatabaseModel>(): ListDatabaseObjectsQueryBuilder<T> {
        return new ListDatabaseObjectsQueryBuilder<T>();
    }

    public GetObject<T extends iDatabaseModel>(key: string): GetDatabaseObjectQueryBuilder<T> {
        return new GetDatabaseObjectQueryBuilder<T>(key);
    }

    public GetObjects<T extends iDatabaseModel>(): GetDatabaseObjectsQueryBuilder<T> {
        return new GetDatabaseObjectsQueryBuilder<T>();
    }

    public ModifyObject<T extends iDatabaseModel>(key: string): ModifyDatabaseObjectQueryBuilder<T> {
        return new ModifyDatabaseObjectQueryBuilder<T>(key);
    }

    public PutObject<T extends iDatabaseModel>(key: string, obj: T): PutDatabaseObjectQueryBuilder<T> {
        return new PutDatabaseObjectQueryBuilder<T>(key, obj);
    }

    public CreateNewObject<T extends iDatabaseModel>(key: string): CreateNewDatabaseObjectQueryBuilder<T> {
        return new CreateNewDatabaseObjectQueryBuilder<T>(key);
    }

    public DeleteObject<T extends iDatabaseModel>(key: string): DeleteDatabaseObjectQueryBuilder<T> {
        return new DeleteDatabaseObjectQueryBuilder<T>(key);
    }
}
