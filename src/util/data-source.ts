import { DataSource } from 'typeorm';
import { ActiveRconServer } from '../database_models/activeRconServer';
import { ComponentInteractionHandler } from '../database_models/componentInteractionHandler';
import { CS2PlaytestingInformation } from '../database_models/cs2PlaytestingInformation';
import { CS2PugQueue } from '../database_models/cs2PugQueue';
import { GuildPlaytestingInformation } from '../database_models/guildPlaytestingInformation';
import { GuildSettings } from '../database_models/guildSettings';
import { PlaytestRequest } from '../database_models/playtestRequest';
import { RconServer } from '../database_models/rconServer';
import { ScheduledPlaytest } from '../database_models/scheduledPlaytest';
import { UserSettings } from '../database_models/userSettings';
import { AddCascadeSave1714853845629 } from '../migrations/1714853845629-add-cascade-save';

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST,
    port: 5432,
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: 'squidbot_testing',
    synchronize: true,
    logging: true,
    entities: [
        ActiveRconServer,
        ComponentInteractionHandler,
        CS2PlaytestingInformation,
        CS2PugQueue,
        GuildPlaytestingInformation,
        GuildSettings,
        PlaytestRequest,
        RconServer,
        ScheduledPlaytest,
        UserSettings,
    ],
    migrations: [AddCascadeSave1714853845629],
    ssl: true,
    extra: {
        ssl: {
            rejectUnauthorized: false,
        },
    },
});
