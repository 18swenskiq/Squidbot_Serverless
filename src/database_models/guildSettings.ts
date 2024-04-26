import { collection, id } from 's3-db';
import { Snowflake } from '../discord_api/snowflake';
import { Guid } from '../util/guid';

@collection()
export class DB_GuildSettings {
    @id()
    id?: Guid;
    assignableRoles: Snowflake[];
    rconServers: Guid[];
    playtesting: {
        cs2: {
            enabled: boolean;
            requestChannel: Snowflake;
            announceChannel: Snowflake;
            playtestChannel: Snowflake;
            competitiveChannel: Snowflake;
        };
    };
    activePlaytest: Guid | null;
    pugging_cs2_enabled: boolean;

    constructor() {
        this.assignableRoles = [];
        this.rconServers = [];
        this.playtesting = {
            cs2: {
                enabled: false,
                requestChannel: '',
                announceChannel: '',
                playtestChannel: '',
                competitiveChannel: '',
            },
        };
        this.activePlaytest = null;
        this.pugging_cs2_enabled = false;
    }
}
