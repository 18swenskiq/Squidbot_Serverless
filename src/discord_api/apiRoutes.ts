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
    return res.data as Role[];
  }

  public static async addMemberRole (guildId: Snowflake, userId: Snowflake, roleId: Snowflake): Promise<void> {
    const url = `${DiscordApiRoutes.baseUrl}/guilds/${guildId}/members/${userId}/roles/${roleId}`;
    await axios.put(url, DiscordApiRoutes.authHeaderConfig);
  }

  public static async removeMemberRole (guildId: Snowflake, userId: Snowflake, roleId: Snowflake): Promise<void> {
    const url = `${DiscordApiRoutes.baseUrl}/guilds/${guildId}/members/${userId}/roles/${roleId}`;
    await axios.delete(url, DiscordApiRoutes.authHeaderConfig);
  }
}
