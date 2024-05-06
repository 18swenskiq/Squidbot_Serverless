import { EntityTarget, ObjectLiteral, Repository } from 'typeorm';
import { AppDataSource } from '../util/data-source';

export const BaseDomainService = <T extends ObjectLiteral>(entity: EntityTarget<T>) => {
    abstract class DomainServiceMixin {
        protected repository: Repository<T>;

        constructor() {
            AppDataSource.getRepository(entity);
        }
    }

    return DomainServiceMixin;
};
