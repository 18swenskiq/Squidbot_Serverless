import axios from 'axios';
import { GuildMember } from './guildMember';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export abstract class MiscEndpoints {
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  private static readonly baseUrl: string = 'https://discord.com/api/v10'; /// applications/${process.env.APP_ID}`;

  public static async GetGuildMembers (guildId: string): Promise<GuildMember[]> {
    // TODO: Limitation, this currently only supports guilds with 250 members. Update to continually get them if needed;
    const url = this.baseUrl + `/guilds/${guildId}/members?limit=250`;

    try {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      const response = await axios.get(url, { headers: { Authorization: `Bot ${process.env.BOT_TOKEN}` } });
      return response.data;
    } catch (exception) {
      console.log(`ERROR recieved from ${url}`, exception);
      return [];
    }
  }
}
