import { GuildEventEntityMetadata } from './guildEventEntityMetadata';
import { GuildEventEntityType } from './guildEventEntityType';
import { GuildEventStatus } from './guildEventStatus';
import { PrivacyLevel } from './privacyLevel';
import { Snowflake } from './snowflake';
import { User } from './user';

export interface GuildScheduledEvent {
    id: Snowflake;
    guild_id: Snowflake;
    channel_id?: Snowflake;
    creator_id?: Snowflake;
    name: string;
    description?: string;
    scheduled_start_time: string;
    scheduled_end_time?: string;
    privacy_level: PrivacyLevel;
    status: GuildEventStatus;
    entity_type: GuildEventEntityType;
    entity_id?: Snowflake;
    entity_metadata?: GuildEventEntityMetadata;
    creator?: User;
    user_count?: number;
    image?: string;
}
