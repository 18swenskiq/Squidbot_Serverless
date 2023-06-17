import { Snowflake } from '../discord_api/snowflake';

export type HandlableComponentInteractionType = 'AssignRoles';

export interface DB_ComponentInteractionHandler {
  type: HandlableComponentInteractionType;
  creationTimeEpoch: number;
  createdBy: Snowflake;
  timesHandled: number;
}
