import { Snowflake } from '../discord_api/snowflake';
import { Guid } from '../util/guid';

export interface DB_PlaytestRequest {
    Id: Guid;
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
}
