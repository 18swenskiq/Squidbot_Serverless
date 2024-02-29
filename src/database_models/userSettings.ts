import { Snowflake } from '../discord_api/snowflake';
import { Guid } from '../util/guid';
import { iDatabaseModel } from './iDatabaseModel';

export class DB_UserSettings implements iDatabaseModel {
    timeZoneName: string;
    activeRconServer: { [guildId: Snowflake]: Guid };
    steamLink: string; // This is steamID64

    constructor() {
        this.timeZoneName = '';
        this.activeRconServer = {};
        this.steamLink = '';
    }

    public GetTopLevelKey(): string {
        return `UserSettings`;
    }

    public BuildKey(id: string): string {
        return `${this.GetTopLevelKey()}/${id}.bson`;
    }
}
