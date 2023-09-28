import { Snowflake } from '../discord_api/snowflake';
import { Guid } from '../util/guid';

export interface DB_UserSettings {
    timeZoneName: string;
    activeRconServer: { [guildId: Snowflake]: Guid };
}
