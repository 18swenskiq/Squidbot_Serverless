import { collection, id } from 's3-db';
import { Snowflake } from '../discord_api/snowflake';
import { CS2PUGGameMode } from '../enums/CS2PUGGameMode';
import { CS2PUGMapSelectionMode } from '../enums/CS2PUGMapSelectionMode';
import { GenerateGuid, Guid } from '../util/guid';

@collection()
export class DB_CS2PugQueue {
    @id()
    id: Guid;
    queueStartTime: Date;
    queueExpirationTime: Date;
    usersInQueue: Snowflake[];
    gameType: CS2PUGGameMode;
    mapSelectionMode: CS2PUGMapSelectionMode;
    activeChannel: Snowflake;

    stopQueueButtonId: Guid;
    joinQueueButtonId: Guid;
    leaveQueueButtonId: Guid;

    voteComponentId: Guid;
    mapVotes: { userId: string; mapVote: string }[] = [];

    constructor() {
        this.id = GenerateGuid();
        this.queueStartTime = new Date();

        this.queueExpirationTime = new Date();
        this.queueExpirationTime.setMinutes(this.queueStartTime.getMinutes() + 15);

        this.usersInQueue = [];
        this.gameType = CS2PUGGameMode.undefined;
        this.mapSelectionMode = CS2PUGMapSelectionMode.undefined;
        this.activeChannel = '';
        this.stopQueueButtonId = GenerateGuid();
        this.joinQueueButtonId = GenerateGuid();
        this.leaveQueueButtonId = GenerateGuid();
        this.voteComponentId = GenerateGuid();
    }
}
