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
    await DiscordApiRoutes.sendRequest('PUT', url);
  }

  public static async removeMemberRole (guildId: Snowflake, userId: Snowflake, roleId: Snowflake): Promise<void> {
    const url = `${DiscordApiRoutes.baseUrl}/guilds/${guildId}/members/${userId}/roles/${roleId}`;
    await DiscordApiRoutes.sendRequest('DELETE', url);
  }

  private static async sendRequest (requestType: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE', url: string): Promise<void> {
    const authHeader = DiscordApiRoutes.authHeaderConfig;
    try {
      switch (requestType) {
        case 'GET':
          await axios.get(url, authHeader);
          break;
        case 'POST':
          await axios.post(url, null, authHeader);
          break;
        case 'PUT':
          await axios.put(url, null, authHeader);
          break;
        case 'PATCH':
          await axios.patch(url, null, authHeader);
          break;
        case 'DELETE':
          await axios.delete(url, authHeader);
          break;
      }
      console.log('Successfully completed ', requestType, ' request to ', url);
    } catch (error: any) {
      const util = require('util');
      console.log('FAILED running ', requestType, ' on ', url);
      console.log('Error Data:', util.inspect(error.response.data, { showHidden: false, depth: null, colors: false }));
      console.log('Error Status', util.inspect(error.response.status, { showHidden: false, depth: null, colors: false }));
      console.log('Error Response Headers', util.inspect(error.response.headers, { showHidden: false, depth: null, colors: false }));
    }
  }
}
