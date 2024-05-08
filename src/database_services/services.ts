import { GuildSettingsService } from './guildSettingsService';
import { PlaytestRequestsService } from './playtestRequestsService';

export abstract class Services {
    public static GuildSettingsSvc = new GuildSettingsService();
    public static PlaytestRequestsSvc = new PlaytestRequestsService();
}
