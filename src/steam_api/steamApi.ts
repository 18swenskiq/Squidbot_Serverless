import axios from 'axios';
import { CSGOWorkshopMapDetail } from './csgoWorkshopMapDetail';
import { PlayerSummary } from './playerSummary';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export abstract class SteamApi {
    static readonly baseUrl: string = 'https://api.steampowered.com';

    public static async GetCSGOWorkshopMapDetail(workshopId: string): Promise<CSGOWorkshopMapDetail> {
        const url = `${this.baseUrl}/IPublishedFileService/GetDetails/v1/?key=${process.env.STEAM_WEB_API_KEY}&publishedfileids%5B0%5D=${workshopId}&includetags=true&includeadditionalpreviews=true&includekvtags=true&includemetadata=true`;
        const res = await axios.get(url);
        return res.data.response.publishedfiledetails[0] as CSGOWorkshopMapDetail;
    }

    public static async GetSteamUserSummary(steamId: string): Promise<PlayerSummary | undefined> {
        const url = `${this.baseUrl}/ISteamUser/GetPlayerSummaries/v2/?key=${process.env.STEAM_WEB_API_KEY}&steamids=${steamId}`;
        const res = await axios.get(url);

        const players: PlayerSummary[] = res.data.response.players;
        return players.find((x) => x);
    }
}
