import { User } from './user';

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

  constructor (user: User, roles: Snowflake[], premiumSince: undefined, permissions: string, pending: boolean, nick: string | null, mute: boolean, joinedAt: Date, isPending: boolean, deaf: boolean) {
    this.user = user;
    this.roles = roles;
    this.premium_since = premiumSince;
    this.permissions = permissions;
    this.pending = pending;
    this.nick = nick;
    this.mute = mute;
    this.joined_at = joinedAt;
    this.is_pending = isPending;
    this.deaf = deaf;
  }
}
