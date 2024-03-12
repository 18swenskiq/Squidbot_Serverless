import { Snowflake } from '../discord_api/snowflake';
import { GenerateGuid, Guid } from '../util/guid';
import { iDatabaseModel } from './iDatabaseModel';

export class DB_ScheduledPlaytest implements iDatabaseModel {
    Id: Guid;
    game: string;
    mapName: string;
    mainAuthor: Snowflake;
    otherAuthors: Snowflake[];
    thumbnailImage: string;
    playtestTime: Date;
    workshopId: string;
    mapType: string;
    playtestType: string;
    moderator: Snowflake;
    eventId: Snowflake;
    server: string;

    constructor() {
        this.Id = GenerateGuid();
        this.game = '';
        this.mapName = '';
        this.mainAuthor = '';
        this.otherAuthors = [];
        this.thumbnailImage = '';
        this.playtestTime = new Date();
        this.workshopId = '';
        this.mapType = '';
        this.playtestType = '';
        this.moderator = '';
        this.eventId = '';
        this.server = '';
    }

    public GetTopLevelKey(): string {
        return `ScheduledPlaytests`;
    }

    public BuildKey(id: string, modifiedRoot: string = ''): string {
        if (modifiedRoot) {
            return `${modifiedRoot}/${id}.bson`;
        }
        return `${this.GetTopLevelKey()}/${id}.bson`;
    }
}
