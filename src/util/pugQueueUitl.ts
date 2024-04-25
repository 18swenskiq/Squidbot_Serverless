import { DB_CS2PugQueue } from '../database_models/cs2PugQueue';
import { DiscordApiRoutes } from '../discord_api/apiRoutes';
import { CS2PUGGameMode } from '../enums/CS2PUGGameMode';
import { SteamApi } from '../steam_api/steamApi';

export abstract class PugQueueUtil {
    public static async SetupPUG(queue: DB_CS2PugQueue, mapIds: string[]): Promise<void> {
        const randomMap = mapIds[Math.floor(Math.random() * mapIds.length)];
        const mapDetails = await SteamApi.GetCSGOWorkshopMapDetail(randomMap);

        await DiscordApiRoutes.createNewMessage(queue.activeChannel, `Selected map is ${mapDetails.title}!`);

        await DiscordApiRoutes.createNewMessage(queue.activeChannel, `Determining teams...`);
    }

    public static GetMaxPlayersForGamemode(gamemode: CS2PUGGameMode): number {
        switch (gamemode) {
            case CS2PUGGameMode.wingman:
                return 4;
            case CS2PUGGameMode.threesome:
                return 6;
            case CS2PUGGameMode.classic:
                return 10;
            case CS2PUGGameMode.arena:
                return 2;
            default:
                throw Error('Invalid gamemode');
        }
    }
}
