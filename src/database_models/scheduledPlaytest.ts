import { Snowflake } from '../discord_api/snowflake';
import { Guid } from '../util/guid';

export interface DB_ScheduledPlaytest {
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
}
