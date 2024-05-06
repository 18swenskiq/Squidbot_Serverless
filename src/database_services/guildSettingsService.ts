import { GuildSettings } from '../database_models/guildSettings';
import { Snowflake } from '../discord_api/snowflake';
import { BaseDomainService } from './baseDomainService';
import { IDatabaseService } from './iDatabaseService';

export class GuildSettingsService extends BaseDomainService(GuildSettings) implements IDatabaseService<GuildSettings> {
    public async Save(entity: GuildSettings): Promise<GuildSettings> {
        return await this.repository.save(entity);
    }

    public async GetById(id: Snowflake): Promise<GuildSettings | null> {
        const ent = await this.repository.findOneBy({ id: id });

        return ent;
    }
}
