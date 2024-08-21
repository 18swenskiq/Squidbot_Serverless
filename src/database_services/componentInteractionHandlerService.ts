import { FindOptionsWhere } from 'typeorm';
import { BaseDomainService } from './baseDomainService';
import { IDatabaseService } from './iDatabaseService';
import { ComponentInteractionHandler } from '../database_models/componentInteractionHandler';
import { Guid } from '../util/guid';

export class ComponentInteractionHandlerService
    extends BaseDomainService(ComponentInteractionHandler)
    implements IDatabaseService<ComponentInteractionHandler>
{
    private relations: string[] = [];

    public async Save(entity: ComponentInteractionHandler): Promise<ComponentInteractionHandler> {
        return await this.repository.save(entity);
    }

    public async GetById(id: Guid): Promise<ComponentInteractionHandler | null> {
        const ent = await this.repository.findOne({ where: { id: id }, relations: this.relations });

        return ent;
    }

    public async GetByIds(ids: Guid[]): Promise<ComponentInteractionHandler[]> {
        const objs = ids.map((i) => {
            return {
                id: i,
            };
        });

        const result = this.repository.find({
            where: objs as FindOptionsWhere<ComponentInteractionHandler>,
            relations: this.relations,
        });
        return result;
    }

    public async GetAllWhere(
        options: FindOptionsWhere<ComponentInteractionHandler>
    ): Promise<ComponentInteractionHandler[]> {
        return await this.repository.findBy(options);
    }

    public async DeleteById(id: Guid): Promise<void> {
        await this.repository.softDelete(id);
    }
}
