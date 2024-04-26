import { collection, id } from 's3-db';
import { Snowflake } from '../discord_api/snowflake';
import { GenerateGuid, Guid } from '../util/guid';

@collection()
export class DB_PlaytestRequest {
    @id()
    Id: Guid;
    game: string;
    mapName: string;
    mainAuthor: Snowflake;
    otherAuthors: Snowflake[];
    thumbnailImage: string;
    requestDate: string;
    requestTime: string;
    workshopId: string;
    mapType: string;
    playtestType: string;
    dateSubmitted: Date;

    constructor() {
        this.Id = GenerateGuid();
        this.game = '';
        this.mapName = '';
        this.mainAuthor = '';
        this.otherAuthors = [];
        this.thumbnailImage = '';
        this.requestDate = '';
        this.requestTime = '';
        this.workshopId = '';
        this.mapType = '';
        this.playtestType = '';
        this.dateSubmitted = new Date();
    }
}
