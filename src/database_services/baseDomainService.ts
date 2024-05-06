import { EntityTarget, ObjectLiteral, Repository } from 'typeorm';
import { AppDataSource } from '../util/data-source';

export const BaseDomainService = <T extends ObjectLiteral>(entity: EntityTarget<T>) => {
    abstract class DomainServiceMixin {
        get repository(): Repository<T> {
            return AppDataSource.getRepository(entity);
        }
    }

    return DomainServiceMixin;
};
