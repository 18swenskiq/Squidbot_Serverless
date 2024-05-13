import { FindOptionsWhere } from 'typeorm';
import { PlaytestRequest } from '../database_models/playtestRequest';
import { Guid } from '../util/guid';
import { BaseDomainService } from './baseDomainService';
import { IDatabaseService } from './iDatabaseService';

export class PlaytestRequestsService
    extends BaseDomainService(PlaytestRequest)
    implements IDatabaseService<PlaytestRequest>
{
    public async Save(entity: PlaytestRequest): Promise<PlaytestRequest> {
        return await this.repository.save(entity);
    }

    public async GetById(id: Guid): Promise<PlaytestRequest | null> {
        const ent = await this.repository.findOneBy({ id: id });

        return ent;
    }

    public async GetByIds(ids: Guid[]): Promise<PlaytestRequest[]> {
        const objs = ids.map((i) => {
            return {
                id: i,
            };
        });

        const result = this.repository.find({
            where: objs as FindOptionsWhere<PlaytestRequest>,
        });
        return result;
    }

    public async GetAllWhere(options: FindOptionsWhere<PlaytestRequest>): Promise<PlaytestRequest[]> {
        return await this.repository.findBy(options);
    }
}
