import { FindOptionsWhere, UpdateResult } from 'typeorm';
import { Guid } from '../util/guid';
import { BaseDomainService } from './baseDomainService';
import { IDatabaseService } from './iDatabaseService';
import { CS2PugQueue } from '../database_models/cs2PugQueue';

export class CS2PugQueueService extends BaseDomainService(CS2PugQueue) implements IDatabaseService<CS2PugQueue> {
    private relations: string[] = ['stopQueueButton', 'joinQueueButton', 'leaveQueueButton', 'voteComponent'];

    public async Save(entity: CS2PugQueue): Promise<CS2PugQueue> {
        return await this.repository.save(entity);
    }

    public async GetById(id: Guid): Promise<CS2PugQueue | null> {
        const ent = await this.repository.findOne({ where: { id: id }, relations: this.relations });

        return ent;
    }

    public async GetByIds(ids: Guid[]): Promise<CS2PugQueue[]> {
        const objs = ids.map((i) => {
            return {
                id: i,
            };
        });

        const result = this.repository.find({
            where: objs as FindOptionsWhere<CS2PugQueue>,
            relations: this.relations,
        });
        return result;
    }

    public async GetAllWhere(options: FindOptionsWhere<CS2PugQueue>): Promise<CS2PugQueue[]> {
        return await this.repository.findBy(options);
    }

    public async DeleteById(id: Guid): Promise<UpdateResult> {
        return await this.repository.softDelete(id);
    }
}
