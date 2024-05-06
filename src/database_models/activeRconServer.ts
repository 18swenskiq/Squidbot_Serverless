import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Guid } from '../util/guid';
import { Snowflake } from '../discord_api/snowflake';
import { RconServer } from './rconServer';
import { UserSettings } from './userSettings';
import { IDatabaseModel } from '../util/databaseRepository';

@Entity()
export class ActiveRconServer implements IDatabaseModel {
    @PrimaryGeneratedColumn('uuid')
    id: Guid;

    @Column({ type: 'text' })
    guildId: Snowflake;

    @OneToOne(() => RconServer, { cascade: true })
    @JoinColumn()
    rconServer: RconServer;

    @ManyToOne(() => UserSettings, (userSettings) => userSettings.activeRconServer)
    userSettings: UserSettings;
}
