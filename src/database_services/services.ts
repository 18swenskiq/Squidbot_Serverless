import { GuildSettingsService } from './guildSettingsService';
import { PlaytestRequestsService } from './playtestRequestsService';
import { UserSettingsService } from './userSettingsService';

export abstract class Services {
    public static GuildSettingsSvc = new GuildSettingsService();
    public static PlaytestRequestsSvc = new PlaytestRequestsService();
    public static UserSettingsSvc = new UserSettingsService();
}
