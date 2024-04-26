import { Snowflake } from '../discord_api/snowflake';

export type HandlableComponentInteractionType = 'AssignRoles' | 'StopPUG' | 'JoinPUG' | 'LeavePUG' | 'PUGMapVote';

export class DB_ComponentInteractionHandler {
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
