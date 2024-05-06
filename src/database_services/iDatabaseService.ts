import { Snowflake } from '../discord_api/snowflake';
import { Guid } from '../util/guid';

export interface IDatabaseService<T> {
    Save(entity: T): Promise<T>;
    GetById(id: Guid | Snowflake): Promise<T | null>;
}
