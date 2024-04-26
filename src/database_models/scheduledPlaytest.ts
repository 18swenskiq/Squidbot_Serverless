import { collection, id } from 's3-db';
import { Snowflake } from '../discord_api/snowflake';
import { GenerateGuid, Guid } from '../util/guid';

@collection()
export class DB_ScheduledPlaytest {
    @id()
    id: Guid;
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
        this.id = GenerateGuid();
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
}
