import { Snowflake } from './snowflake';
import { User } from './user';

export class GuildMember {
    public user: User | null = null;
    public nick: string | null = null;
    public avatar: string | null = null;
    public roles: Snowflake[] = [];
    public joined_at: any = '';
    public premium_since: any = '';
    public deaf: boolean = false;
    public mute: boolean = false;
    public flags: number = 0;
    public pending: boolean | null = null;
    public permissions: string | null = null;
    public communication_disabled_until: any = '';
}
