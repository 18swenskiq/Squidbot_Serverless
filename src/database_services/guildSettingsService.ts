import { FindOptionsWhere } from 'typeorm';
import { GuildSettings } from '../database_models/guildSettings';
import { Snowflake } from '../discord_api/snowflake';
import { BaseDomainService } from './baseDomainService';
import { IDatabaseService } from './iDatabaseService';

export class GuildSettingsService extends BaseDomainService(GuildSettings) implements IDatabaseService<GuildSettings> {
    private relations: string[] = ['playtesting', 'playtesting.cs2'];

    public async Save(entity: GuildSettings): Promise<GuildSettings> {
        return await this.repository.save(entity);
    }

    public async GetById(id: Snowflake): Promise<GuildSettings | null> {
        const ent = await this.repository.findOne({ where: { id: id }, relations: this.relations });

        return ent;
    }

    public async GetByIds(ids: Snowflake[]): Promise<GuildSettings[]> {
        const objs = ids.map((i) => {
            return {
                id: i,
            };
        });

        const result = this.repository.find({
            where: objs as FindOptionsWhere<GuildSettings>,
            relations: this.relations,
        });
        return result;
    }

    public async GetAllWhere(options: FindOptionsWhere<GuildSettings>): Promise<GuildSettings[]> {
        return await this.repository.findBy(options);
    }
}
