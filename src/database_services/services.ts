import { ActiveRconServerService } from './activeRconServerService';
import { ComponentInteractionHandlerService } from './componentInteractionHandlerService';
import { CS2PugQueueService } from './cs2PugQueueService';
import { GuildSettingsService } from './guildSettingsService';
import { PlaytestRequestsService } from './playtestRequestsService';
import { RconServerService } from './rconServerService';
import { ScheduledPlaytestService } from './scheduledPlaytestService';
import { UserSettingsService } from './userSettingsService';

export abstract class Services {
    public static ActiveRconServerSvc = new ActiveRconServerService();
    public static ComponentInteractionHandlerSvc = new ComponentInteractionHandlerService();
    public static CS2PugQueueSvc = new CS2PugQueueService();
    public static GuildSettingsSvc = new GuildSettingsService();
    public static PlaytestRequestsSvc = new PlaytestRequestsService();
    public static RconServerSvc = new RconServerService();
    public static ScheduledPlaytestSvc = new ScheduledPlaytestService();
    public static UserSettingsSvc = new UserSettingsService();
}
