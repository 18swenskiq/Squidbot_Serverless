import axios from 'axios';
import { Role } from './role';
import { Snowflake } from './snowflake';
import { Member } from './member';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export abstract class DiscordApiRoutes {
  static readonly baseUrl: string = 'https://discord.com/api/v10';

  public static async getGuildRoles (guildId: Snowflake): Promise<Role[]> {
    const url = `${DiscordApiRoutes.baseUrl}/guilds/${guildId}/roles`;
    const res = await axios.get(url);
    console.log('axios response:', res);
    return res.data as Role[];
  }

  public static async getGuildMember (guildId: Snowflake, userId: Snowflake): Promise<Member> {
    const url = `${DiscordApiRoutes.baseUrl}/guilds/${guildId}/members/${userId}`;
    const res = await axios.get(url);
    console.log('axios response:', res);
    return res.data as Member;
  }
}
