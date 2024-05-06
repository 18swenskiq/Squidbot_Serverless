import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Guid } from '../util/guid';
import { Snowflake } from '../discord_api/snowflake';
import { IDatabaseModel } from '../util/databaseRepository';

@Entity()
export class CS2PlaytestingInformation implements IDatabaseModel {
    @PrimaryGeneratedColumn('uuid')
    id: Guid;

    @Column({ type: 'bool' })
    enabled: boolean;

    @Column({ type: 'text' })
    requestChannel: Snowflake;

    @Column({ type: 'text' })
    announceChannel: Snowflake;

    @Column({ type: 'text' })
    playtestChannel: Snowflake;

    @Column({ type: 'text' })
    competitiveChannel: Snowflake;
}
