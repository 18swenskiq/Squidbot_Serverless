import { FindOptionsWhere } from 'typeorm';
import { Snowflake } from '../discord_api/snowflake';
import { BaseDomainService } from './baseDomainService';
import { IDatabaseService } from './iDatabaseService';
import { UserSettings } from '../database_models/userSettings';

export class UserSettingsService extends BaseDomainService(UserSettings) implements IDatabaseService<UserSettings> {
    private relations: string[] = ['activeRconServer'];

    public async Save(entity: UserSettings): Promise<UserSettings> {
        return await this.repository.save(entity);
    }

    public async GetById(id: Snowflake): Promise<UserSettings | null> {
        const ent = await this.repository.findOne({ where: { id: id }, relations: this.relations });

        return ent;
    }

    public async GetByIds(ids: Snowflake[]): Promise<UserSettings[]> {
        const objs = ids.map((i) => {
            return {
                id: i,
            };
        });

        const result = this.repository.find({
            where: objs as FindOptionsWhere<UserSettings>,
            relations: this.relations,
        });
        return result;
    }

    public async GetAllWhere(options: FindOptionsWhere<UserSettings>): Promise<UserSettings[]> {
        return await this.repository.findBy(options);
    }
}
