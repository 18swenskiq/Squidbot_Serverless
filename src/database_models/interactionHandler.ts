import { collection, id } from 's3-db';
import { Snowflake } from '../discord_api/snowflake';

export type HandlableComponentInteractionType = 'AssignRoles' | 'StopPUG' | 'JoinPUG' | 'LeavePUG' | 'PUGMapVote';

@collection()
export class DB_ComponentInteractionHandler {
    @id()
    id?: string;
    type: HandlableComponentInteractionType;
    creationTimeEpoch: number;
    createdBy: Snowflake;
    timesHandled: number;

    constructor() {
        this.type = 'AssignRoles';
        this.creationTimeEpoch = -1;
        this.createdBy = '';
        this.timesHandled = -1;
    }
}
