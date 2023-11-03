import { Snowflake } from '../discord_api/snowflake';
import { Guid } from '../util/guid';
import { DB_RconServer } from './rconServer';

export interface DB_GuildSettings {
    assignableRoles: Snowflake[];
    rconServers: Guid[];
    cs2PlaytestingEnabled: boolean;
    /**
     * @deprecated Not used anymore
     */
    gameServers: DB_RconServer[];
}
