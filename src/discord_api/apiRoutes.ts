/* eslint-disable @typescript-eslint/restrict-template-expressions */
import axios, { AxiosRequestConfig } from 'axios';
import { Role } from './role';
import { Snowflake } from './snowflake';
import { Interaction } from './interaction';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export abstract class DiscordApiRoutes {
  static readonly baseUrl: string = 'https://discord.com/api/v10';
  static readonly authHeaderConfig: AxiosRequestConfig = {
    headers: {
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

  public static async createFollowupMessage (initialInteraction: Interaction, requestBody: any): Promise<void> {
    const url = `${DiscordApiRoutes.baseUrl}/webhooks/${process.env.APP_ID}/${initialInteraction.token}`;
    await DiscordApiRoutes.sendRequest('POST', url, requestBody);
  }

  public static async editInitialInteractionResponse (initialInteraction: Interaction, newBody: any): Promise<void> {
    const url = `${DiscordApiRoutes.baseUrl}/webhooks/${process.env.APP_ID}/${initialInteraction.token}/messages/@original`;
    await DiscordApiRoutes.sendRequest('PATCH', url, newBody);
  }

  public static async deleteInitialInteractionResponse (initialInteraction: Interaction): Promise<void> {
    const url = `${DiscordApiRoutes.baseUrl}/webhooks/${process.env.APP_ID}/${initialInteraction.token}/messages/@original`;
    await DiscordApiRoutes.sendRequest('DELETE', url);
  }

  private static async sendRequest (requestType: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE', url: string, payload: any = null): Promise<any> {
    const authHeader = DiscordApiRoutes.authHeaderConfig;
    try {
      switch (requestType) {
        case 'GET':
          return await axios.get(url, authHeader);
        case 'POST':
          return await axios.post(url, payload, authHeader);
        case 'PUT':
          return await axios.put(url, payload, authHeader);
        case 'PATCH':
          return await axios.patch(url, payload, authHeader);
        case 'DELETE':
          return await axios.delete(url, authHeader);
      }
    } catch (error: any) {
      const util = require('util');
      console.log('FAILED running ', requestType, ' on ', url);
      console.log('Error Data:', util.inspect(error.response.data, { showHidden: false, depth: null, colors: false }));
      console.log('Error Status', util.inspect(error.response.status, { showHidden: false, depth: null, colors: false }));
      console.log('Error Response Headers', util.inspect(error.response.headers, { showHidden: false, depth: null, colors: false }));
    }
  }
}
