import { DeepPartial, EntityTarget, FindOptionsWhere, ObjectLiteral } from 'typeorm';
import { AppDataSource } from './data-source';

export abstract class DatabaseRepository {
    public static async GetEntityBy<T extends IDatabaseModel>(
        entity: EntityTarget<T>,
        where: FindOptionsWhere<T> | FindOptionsWhere<T>[]
    ): Promise<T | null> {
        const dataSource = AppDataSource;

        const repository = dataSource.getRepository(entity);

        // Load all relations
        const relations = repository.metadata.relations.map((relation) => {
            return relation.propertyName;
        });

        return repository.findOne({ where: where, relations: relations });
    }

    public static async SaveEntity<T extends DeepPartial<ObjectLiteral>>(entity: T) {
        const dataSource = AppDataSource;

        const repository = dataSource.getRepository(entity as any);

        repository.save<T>(entity);
    }
}

export interface IDatabaseModel {}
