import { Snowflake } from '../discord_api/snowflake';
import { Guid } from '../util/guid';
import { iDatabaseModel } from './iDatabaseModel';

export class DB_GuildSettings implements iDatabaseModel {
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

    public GetTopLevelKey(): string {
        return `GuildSettings`;
    }

    public BuildKey(id: string, modifiedRoot: string = ''): string {
        if (modifiedRoot) {
            return `${modifiedRoot}/${id}.bson`;
        }
        return `${this.GetTopLevelKey()}/${id}.bson`;
    }
}
