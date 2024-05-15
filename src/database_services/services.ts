import { GuildSettingsService } from './guildSettingsService';
import { PlaytestRequestsService } from './playtestRequestsService';
import { RconServerService } from './rconServerService';
import { UserSettingsService } from './userSettingsService';

export abstract class Services {
    public static GuildSettingsSvc = new GuildSettingsService();
    public static PlaytestRequestsSvc = new PlaytestRequestsService();
    public static RconServerSvc = new RconServerService();
    public static UserSettingsSvc = new UserSettingsService();
}
