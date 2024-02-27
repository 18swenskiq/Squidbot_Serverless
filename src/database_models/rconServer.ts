import { Snowflake } from '../discord_api/snowflake';
import { GenerateGuid, Guid } from '../util/guid';
import { iDatabaseModel } from './iDatabaseModel';

export type Game = 'cs2';

export class DB_RconServer implements iDatabaseModel {
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

    public BuildKey(id: string): string {
        return `RconServers/${id}.bson`;
    }
}
