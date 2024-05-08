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

    public async GetAllWhere(options: FindOptionsWhere<PlaytestRequest>): Promise<PlaytestRequest[]> {
        return await this.repository.findBy(options);
    }
}
