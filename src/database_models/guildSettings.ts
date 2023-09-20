import { Snowflake } from '../discord_api/snowflake';
import { GameServer } from '../util/gameServer';

export interface DB_GuildSettings {
  assignableRoles: Snowflake[];
  gameServers: GameServer[];
}
