import { FindOptionsWhere, UpdateResult } from 'typeorm';
import { Guid } from '../util/guid';
import { BaseDomainService } from './baseDomainService';
import { IDatabaseService } from './iDatabaseService';
import { ActiveRconServer } from '../database_models/activeRconServer';

export class ActiveRconServerService
    extends BaseDomainService(ActiveRconServer)
    implements IDatabaseService<ActiveRconServer>
{
    private relations: string[] = ['rconServer', 'userSettings'];

    public async Save(entity: ActiveRconServer): Promise<ActiveRconServer> {
        return await this.repository.save(entity);
    }

    public async GetById(id: Guid): Promise<ActiveRconServer | null> {
        const ent = await this.repository.findOne({ where: { id: id }, relations: this.relations });

        return ent;
    }

    public async GetByIds(ids: Guid[]): Promise<ActiveRconServer[]> {
        const objs = ids.map((i) => {
            return {
                id: i,
            };
        });

        const result = this.repository.find({
            where: objs as FindOptionsWhere<ActiveRconServer>,
            relations: this.relations,
        });
        return result;
    }

    public async GetAllWhere(options: FindOptionsWhere<ActiveRconServer>): Promise<ActiveRconServer[]> {
        return await this.repository.findBy(options);
    }

    public async DeleteById(id: Guid): Promise<UpdateResult> {
        return await this.repository.softDelete(id);
    }
}
