import { Snowflake } from '../discord_api/snowflake';
import { GenerateGuid, Guid } from '../util/guid';
import { iDatabaseModel } from './iDatabaseModel';

export class DB_PlaytestRequest implements iDatabaseModel {
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

    public GetTopLevelKey(): string {
        return `PlaytestRequests`;
    }

    public BuildKey(id: string): string {
        return `${this.GetTopLevelKey()}/${id}.bson`;
    }
}
