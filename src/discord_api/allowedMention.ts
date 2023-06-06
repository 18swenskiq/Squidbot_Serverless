import { Snowflake } from './snowflake';

export type AllowedMentionType = 'roles' | 'users' | 'everyone';

export class AllowedMention {
  parse: AllowedMentionType[];
  roles: Snowflake[];
  users: Snowflake[];
  replied_user: boolean;

  constructor (mentionUser: boolean) {
    this.parse = [];
    this.roles = [];
    this.users = [];
    this.replied_user = mentionUser;
  }
}
