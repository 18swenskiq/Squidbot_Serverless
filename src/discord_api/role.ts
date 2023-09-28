import { Snowflake } from './snowflake';

export interface Role {
    id: Snowflake;
    name: string;
    color: number;
    hoist: boolean;
    icon?: string;
    unicode_emoji?: string;
    position: number;
    permissions: string;
    managed: boolean;
    mentionable: boolean;
    tags?: RoleTags;
}

export interface RoleTags {
    bot_id?: Snowflake;
    integration_id?: Snowflake;
    premium_subscriber?: null; // This is fucked. null represents true, not including it is false
    subscription_listing_id?: Snowflake;
    available_for_purchase?: null;
    guild_connections?: null;
}
