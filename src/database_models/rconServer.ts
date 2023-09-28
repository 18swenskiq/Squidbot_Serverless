import { Snowflake } from "../discord_api/snowflake";
import { Guid } from "../util/guid";

export type Game = 'cs2';

export interface DB_RconServer {
    id: Guid;
    guildId: Snowflake;
    nickname: string;
    ip: string;
    port: string;
    game: Game;
    rconPassword: string;
    countryCode: string;
}