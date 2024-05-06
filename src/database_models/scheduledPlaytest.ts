import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Snowflake } from '../discord_api/snowflake';
import { Guid } from '../util/guid';
import { Game } from '../enums/Game';
import { CS2PlaytestGameMode } from '../enums/CS2PlaytestGameMode';
import { CS2PlaytestType } from '../enums/CS2PlaytestType';
import { RconServer } from './rconServer';
import { IDatabaseModel } from '../util/databaseRepository';

@Entity()
export class ScheduledPlaytest implements IDatabaseModel {
    @PrimaryGeneratedColumn('uuid')
    id: Guid;

    @Column({ type: 'enum', enum: Game, default: Game.undefined })
    game: Game;

    @Column({ type: 'text' })
    mapName: string;

    @Column({ type: 'text' })
    mainAuthor: Snowflake;

    @Column({ type: 'text', array: true })
    otherAuthors: Snowflake[];

    @Column({ type: 'text' })
    thumbnailImage: string;

    @Column({ type: 'timestamptz' })
    playtestTime: Date;

    @Column({ type: 'text' })
    workshopId: string;

    @Column({ type: 'enum', enum: CS2PlaytestGameMode, default: CS2PlaytestGameMode.UNDEFINED })
    mapType: CS2PlaytestGameMode;

    @Column({ type: 'enum', enum: CS2PlaytestType, default: CS2PlaytestType.UNDEFINED })
    playtestType: CS2PlaytestType;

    @Column({ type: 'text' })
    moderator: Snowflake;

    @Column({ type: 'text' })
    eventId: Snowflake;

    @OneToOne(() => RconServer)
    @JoinColumn()
    server: RconServer;
}
