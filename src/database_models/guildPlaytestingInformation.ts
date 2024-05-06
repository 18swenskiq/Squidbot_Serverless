import { Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Guid } from '../util/guid';
import { GuildSettings } from './guildSettings';
import { CS2PlaytestingInformation } from './cs2PlaytestingInformation';
import { IDatabaseModel } from '../util/databaseRepository';

@Entity()
export class GuildPlaytestingInformation implements IDatabaseModel {
    @PrimaryGeneratedColumn('uuid')
    id: Guid;

    @OneToOne(() => GuildSettings, (guildSettings) => guildSettings.playtesting)
    guildSettings: GuildSettings;

    @OneToOne(() => CS2PlaytestingInformation, { cascade: true })
    @JoinColumn()
    cs2: CS2PlaytestingInformation;
}
