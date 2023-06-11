import axios, { AxiosRequestConfig } from 'axios';
import { Role } from './role';
import { Snowflake } from './snowflake';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export abstract class DiscordApiRoutes {
  static readonly baseUrl: string = 'https://discord.com/api/v10';
  static readonly authHeaderConfig: AxiosRequestConfig = {
    headers: {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      Authorization: `Bot ${process.env.BOT_TOKEN}`
    }
  }

  public static async getGuildRoles (guildId: Snowflake): Promise<Role[]> {
    const url = `${DiscordApiRoutes.baseUrl}/guilds/${guildId}/roles`;
    const res = await axios.get(url, DiscordApiRoutes.authHeaderConfig);
    console.log('axios response:', res);
    return res.data as Role[];
  }
}
