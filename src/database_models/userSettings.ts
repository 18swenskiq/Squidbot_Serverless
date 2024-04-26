import { collection, id } from 's3-db';
import { Snowflake } from '../discord_api/snowflake';
import { Guid } from '../util/guid';

@collection()
export class DB_UserSettings {
    @id()
    id?: string;
    timeZoneName: string;
    activeRconServer: { [guildId: Snowflake]: Guid };
    steamLink: string; // This is steamID64

    constructor() {
        this.timeZoneName = '';
        this.activeRconServer = {};
        this.steamLink = '';
    }
}
