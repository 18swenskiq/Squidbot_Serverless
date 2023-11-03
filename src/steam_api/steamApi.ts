import axios from 'axios';
import { CSGOWorkshopMapDetail } from './csgoWorkshopMapDetail';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export abstract class SteamApi {
    static readonly baseUrl: string = 'https://api.steampowered.com';

    public static async GetCSGOWorkshopMapDetail(workshopId: string): Promise<CSGOWorkshopMapDetail> {
        const url = `${this.baseUrl}/IPublishedFileService/GetDetails/v1/?key=${process.env.STEAM_WEB_API_KEY}&publishedfileids%5B0%5D=${workshopId}&includetags=true&includeadditionalpreviews=true&includekvtags=true&includemetadata=true`;
        const res = await axios.get(url);
        return res.data.response.publishedfiledetails[0] as CSGOWorkshopMapDetail;
    }
}
