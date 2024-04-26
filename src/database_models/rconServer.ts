import { collection, id } from 's3-db';
import { Snowflake } from '../discord_api/snowflake';
import { GenerateGuid, Guid } from '../util/guid';

export type Game = 'cs2';

@collection()
export class DB_RconServer {
    @id()
    id: Guid;
    guildId: Snowflake;
    nickname: string;
    ip: string;
    port: string;
    game: Game;
    rconPassword: string;
    countryCode: string;
    ftpHost: string;
    ftpPort: string;
    ftpUsername: string;
    ftpPassword: string;

    constructor() {
        this.id = GenerateGuid();
        this.guildId = '';
        this.nickname = '';
        this.ip = '';
        this.port = '';
        this.game = 'cs2';
        this.rconPassword = '';
        this.countryCode = '';
        this.ftpHost = '';
        this.ftpPort = '';
        this.ftpUsername = '';
        this.ftpPassword = '';
    }
}
