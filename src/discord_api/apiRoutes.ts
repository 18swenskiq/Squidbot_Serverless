/* eslint-disable @typescript-eslint/restrict-template-expressions */
import axios, { AxiosRequestConfig } from 'axios';
import { Role } from './role';
import { Snowflake } from './snowflake';
import { Interaction } from './interaction';
import { Embed } from './embed';
import { User } from './user';
import { GuildEventEntityMetadata } from './guildEventEntityMetadata';
import { GuildEventEntityType } from './guildEventEntityType';
import { GuildScheduledEvent } from './guildScheduledEvent';
import { MessageComponent } from './messageComponent';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export abstract class DiscordApiRoutes {
    static readonly baseUrl: string = 'https://discord.com/api/v10';
    static readonly authHeaderConfig: AxiosRequestConfig = {
        headers: {
            Authorization: `Bot ${process.env.BOT_TOKEN}`,
        },
    };

    public static async getGuildRoles(guildId: Snowflake): Promise<Role[]> {
        const url = `${DiscordApiRoutes.baseUrl}/guilds/${guildId}/roles`;
        const res = await axios.get(url, DiscordApiRoutes.authHeaderConfig);
        return res.data as Role[];
    }

    public static async addMemberRole(guildId: Snowflake, userId: Snowflake, roleId: Snowflake): Promise<void> {
        const url = `${DiscordApiRoutes.baseUrl}/guilds/${guildId}/members/${userId}/roles/${roleId}`;
        await DiscordApiRoutes.sendRequest('PUT', url);
    }

    public static async removeMemberRole(guildId: Snowflake, userId: Snowflake, roleId: Snowflake): Promise<void> {
        const url = `${DiscordApiRoutes.baseUrl}/guilds/${guildId}/members/${userId}/roles/${roleId}`;
        await DiscordApiRoutes.sendRequest('DELETE', url);
    }

    public static async createFollowupMessage(initialInteraction: Interaction, requestBody: any): Promise<void> {
        const url = `${DiscordApiRoutes.baseUrl}/webhooks/${process.env.APP_ID}/${initialInteraction.token}`;
        await DiscordApiRoutes.sendRequest('POST', url, requestBody);
    }

    public static async editInitialInteractionResponse(initialInteraction: Interaction, newBody: any): Promise<void> {
        const url = `${DiscordApiRoutes.baseUrl}/webhooks/${process.env.APP_ID}/${initialInteraction.token}/messages/@original`;
        await DiscordApiRoutes.sendRequest('PATCH', url, newBody);
    }

    public static async deleteInitialInteractionResponse(initialInteraction: Interaction): Promise<void> {
        const url = `${DiscordApiRoutes.baseUrl}/webhooks/${process.env.APP_ID}/${initialInteraction.token}/messages/@original`;
        await DiscordApiRoutes.sendRequest('DELETE', url);
    }

    public static async createNewMessage(
        channelId: Snowflake,
        content: string,
        embeds?: Embed[],
        components: MessageComponent[] | undefined = undefined
    ): Promise<void> {
        const url = `${DiscordApiRoutes.baseUrl}/channels/${channelId}/messages`;
        await DiscordApiRoutes.sendRequest('POST', url, { content: content, embeds: embeds, components: components });
    }

    public static async getUser(userId: Snowflake): Promise<User> {
        const url = `${DiscordApiRoutes.baseUrl}/users/${userId}`;
        const res = await axios.get(url, DiscordApiRoutes.authHeaderConfig);
        return res.data as User;
    }

    public static async deleteGuildEvent(guildId: Snowflake, eventId: Snowflake): Promise<void> {
        const url = `${DiscordApiRoutes.baseUrl}/guilds/${guildId}/scheduled-events/${eventId}`;
        await DiscordApiRoutes.sendRequest('DELETE', url);
    }

    public static async createGuildEvent(
        guildId: Snowflake,
        entityMetadata: GuildEventEntityMetadata,
        name: string,
        scheduledStartTime: string,
        scheduledEndTime: string,
        entityType: GuildEventEntityType,
        description: string
    ): Promise<Snowflake> {
        const url = `${DiscordApiRoutes.baseUrl}/guilds/${guildId}/scheduled-events`;

        const obj = {
            entity_metadata: entityMetadata,
            name: name,
            privacy_level: 2,
            scheduled_start_time: scheduledStartTime,
            scheduled_end_time: scheduledEndTime,
            description: description,
            entity_type: entityType,
        };

        const res = await DiscordApiRoutes.sendRequest('POST', url, obj);
        console.log(res);
        return res.data.id;
    }

    public static async modifyGuildEvent(
        guildId: Snowflake,
        eventId: Snowflake,
        description: string,
        startTime?: string,
        endTime?: string
    ): Promise<void> {
        const url = `${DiscordApiRoutes.baseUrl}/guilds/${guildId}/scheduled-events/${eventId}`;

        let obj: any = {
            description: description,
        };

        if (startTime && endTime) {
            obj['scheduled_start_time'] = startTime;
            obj['scheduled_end_time'] = endTime;
        }

        await DiscordApiRoutes.sendRequest('PATCH', url, obj);
    }

    public static async listGuildEvents(guildId: Snowflake) {
        const url = `${DiscordApiRoutes.baseUrl}/guilds/${guildId}/scheduled-events`;
        const res = await axios.get(url, DiscordApiRoutes.authHeaderConfig);
        return res.data as GuildScheduledEvent[];
    }

    private static async sendRequest(
        requestType: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
        url: string,
        payload: any = null
    ): Promise<any> {
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
            console.log(
                'Error Data:',
                util.inspect(error.response.data, { showHidden: false, depth: null, colors: false })
            );
            console.log(
                'Error Status',
                util.inspect(error.response.status, { showHidden: false, depth: null, colors: false })
            );
            console.log(
                'Error Response Headers',
                util.inspect(error.response.headers, { showHidden: false, depth: null, colors: false })
            );
        }
    }
}
