import { User } from "./user";

export class Member {
    user: User;
    roles: Snowflake[];
    premium_since: undefined;
    permissions: string;
    pending: boolean;
    nick: string | null;
    mute: boolean;
    joined_at: Date;
    is_pending: boolean;
    deaf: boolean;

    constructor(user: User, roles: Snowflake[], premium_since: undefined, permissions: string, pending: boolean, nick: string | null, mute: boolean, joined_at: Date, is_pending: boolean, deaf: boolean)
    {
        this.user = user;
        this.roles = roles;
        this.premium_since = premium_since;
        this.permissions = permissions;
        this.pending = pending;
        this.nick = nick;
        this.mute = mute;
        this.joined_at = joined_at;
        this.is_pending = is_pending;
        this.deaf = deaf;
    }
}