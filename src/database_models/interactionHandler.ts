import { Snowflake } from '../discord_api/snowflake';
import { iDatabaseModel } from './iDatabaseModel';

export type HandlableComponentInteractionType = 'AssignRoles' | 'StopPUG' | 'JoinPUG' | 'LeavePUG';

export class DB_ComponentInteractionHandler implements iDatabaseModel {
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

    public GetTopLevelKey(): string {
        return `InteractableComponents`;
    }

    public BuildKey(id: string): string {
        return `${this.GetTopLevelKey()}/${id}.bson`;
    }
}
