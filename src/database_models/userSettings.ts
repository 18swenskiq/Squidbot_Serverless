import { Snowflake } from '../discord_api/snowflake';
import { Guid } from '../util/guid';
import { iDatabaseModel } from './iDatabaseModel';

export class DB_UserSettings implements iDatabaseModel {
    timeZoneName: string;
    activeRconServer: { [guildId: Snowflake]: Guid };

    constructor() {
        this.timeZoneName = '';
        this.activeRconServer = {};
    }

    public BuildKey(id: string): string {
        return `UserSettings/${id}.bson`;
    }
}
