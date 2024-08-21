import { FindOptionsWhere, UpdateResult } from 'typeorm';
import { Guid } from '../util/guid';
import { BaseDomainService } from './baseDomainService';
import { IDatabaseService } from './iDatabaseService';
import { ScheduledPlaytest } from '../database_models/scheduledPlaytest';

export class ScheduledPlaytestService
    extends BaseDomainService(ScheduledPlaytest)
    implements IDatabaseService<ScheduledPlaytest>
{
    private relations: string[] = ['server'];

    public async Save(entity: ScheduledPlaytest): Promise<ScheduledPlaytest> {
        return await this.repository.save(entity);
    }

    public async GetById(id: Guid): Promise<ScheduledPlaytest | null> {
        const ent = await this.repository.findOne({ where: { id: id }, relations: this.relations });

        return ent;
    }

    public async GetByIds(ids: Guid[]): Promise<ScheduledPlaytest[]> {
        const objs = ids.map((i) => {
            return {
                id: i,
            };
        });

        const result = this.repository.find({
            where: objs as FindOptionsWhere<ScheduledPlaytest>,
            relations: this.relations,
        });
        return result;
    }

    public async GetAllWhere(options: FindOptionsWhere<ScheduledPlaytest>): Promise<ScheduledPlaytest[]> {
        return await this.repository.findBy(options);
    }

    public async DeleteById(id: Guid): Promise<UpdateResult> {
        return await this.repository.softDelete(id);
    }
}
