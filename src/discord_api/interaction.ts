import { Member } from "./member";

export class Interaction
{
    type: InteractionType;
    token: string;
    member: Member;
    id: Snowflake;
    guild_id: Snowflake;
    app_permisions: string;
    guild_locale: string;
    locale: string;
    data: InteractionData;
    channel_id: Snowflake;

    constructor(type: number, token: string, member: Member, id: string, guild_id: string, app_permissions: string, guild_locale: string, locale: string, data: InteractionData, channel_id: string)
    {
        this.type = type;
        this.token = token;
        this.member = member;
        this.id = id;
        this.guild_id = guild_id;
        this.app_permisions = app_permissions;
        this.guild_locale = guild_locale;
        this.locale = locale;
        this.data = data;
        this.channel_id = channel_id;
    }
}

export class InteractionData
{
    options: InteractionDataOptions[];
    type: number;
    name: string;
    id: Snowflake;

    constructor(options: InteractionDataOptions[], type: number, name: string, id: string)
    {
        this.options = options;
        this.type = type;
        this.name = name;
        this.id = id;
    }
}

export class InteractionDataOptions
{
    type: number;
    name: string;
    value: string;

    constructor(type: number, name: string, value: string)
    {
        this.type = type;
        this.name = name;
        this.value = value;
    }
}

export enum InteractionType
{
    /**
     * A ping/heartbeat message.
     */
    PING = 1,
    
    /**
     * A command invocation.
     */
    APPLICATION_COMMAND = 2,

    /**
     * Usage of a message's component
     */
    MESSAGE_COMPONENT = 3,

    /**
     * An ineration sent when an application command option is filled out.
     */
    APPLICATION_COMMAND_AUTOCOMPLETE = 4,
    /**
     * An interaction sent when a modal is submitted.
     */
    MODAL_SUBMIT = 5
}