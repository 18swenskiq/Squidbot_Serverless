import { FindOptionsWhere } from 'typeorm';
import { BaseDomainService } from './baseDomainService';
import { IDatabaseService } from './iDatabaseService';
import { RconServer } from '../database_models/rconServer';
import { Guid } from '../util/guid';

export class RconServerService extends BaseDomainService(RconServer) implements IDatabaseService<RconServer> {
    private relations: string[] = ['guild'];

    public async Save(entity: RconServer): Promise<RconServer> {
        return await this.repository.save(entity);
    }

    public async GetById(id: Guid): Promise<RconServer | null> {
        const ent = await this.repository.findOne({ where: { id: id }, relations: this.relations });

        return ent;
    }

    public async GetByIds(ids: Guid[]): Promise<RconServer[]> {
        const objs = ids.map((i) => {
            return {
                id: i,
            };
        });

        const result = this.repository.find({
            where: objs as FindOptionsWhere<RconServer>,
            relations: this.relations,
        });
        return result;
    }

    public async GetAllWhere(options: FindOptionsWhere<RconServer>): Promise<RconServer[]> {
        return await this.repository.findBy(options);
    }
}
