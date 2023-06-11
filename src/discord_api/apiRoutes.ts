import axios, { AxiosRequestConfig } from 'axios';
import { Role } from './role';
import { Snowflake } from './snowflake';
import { Member } from './member';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export abstract class DiscordApiRoutes {
  static readonly baseUrl: string = 'https://discord.com/api/v10';

  public static async getGuildRoles (guildId: Snowflake): Promise<Role[]> {
    const config: AxiosRequestConfig = {
      headers: {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        Authorization: `Bot ${process.env.BOT_TOKEN}`
      }
    }
    const url = `${DiscordApiRoutes.baseUrl}/guilds/${guildId}/roles`;
    const res = await axios.get(url, config);
    console.log('axios response:', res);
    return res.data as Role[];
  }

  public static async getGuildMember (guildId: Snowflake, userId: Snowflake): Promise<Member> {
    const config: AxiosRequestConfig = {
      headers: {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        Authorization: `Bot ${process.env.BOT_TOKEN}`
      }
    }
    const url = `${DiscordApiRoutes.baseUrl}/guilds/${guildId}/members/${userId}`;
    const res = await axios.get(url, config);
    console.log('axios response:', res);
    return res.data as Member;
  }
}
