import { Snowflake } from '../discord_api/snowflake';
import { CS2PUGGameMode } from '../enums/CS2PUGGameMode';
import { GenerateGuid, Guid } from '../util/guid';
import { iDatabaseModel } from './iDatabaseModel';

export class DB_CS2PugQueue implements iDatabaseModel {
    id: Guid;
    queueStartTime: Date;
    queueExpirationTime: Date;
    usersInQueue: Snowflake[];
    gameType: CS2PUGGameMode;
    activeChannel: Snowflake;

    stopQueueButtonId: Guid;
    joinQueueButtonId: Guid;
    leaveQueueButtonId: Guid;

    constructor() {
        this.id = GenerateGuid();
        this.queueStartTime = new Date();

        this.queueExpirationTime = new Date();
        this.queueExpirationTime.setMinutes(this.queueStartTime.getMinutes() + 15);

        this.usersInQueue = [];
        this.gameType = CS2PUGGameMode.undefined;
        this.activeChannel = '';
        this.stopQueueButtonId = GenerateGuid();
        this.joinQueueButtonId = GenerateGuid();
        this.leaveQueueButtonId = GenerateGuid();
    }

    GetTopLevelKey(): string {
        return 'CS2PugQueues';
    }

    BuildKey(id: string): string {
        return `${this.GetTopLevelKey()}/${id}.bson`;
    }
}
