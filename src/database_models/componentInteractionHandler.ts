import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Snowflake } from '../discord_api/snowflake';
import { HandlableComponentInteractionType } from '../enums/HandlableComponentInteractionType';
import { IDatabaseModel } from '../util/databaseRepository';

@Entity()
export class ComponentInteractionHandler implements IDatabaseModel {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'enum',
        enum: HandlableComponentInteractionType,
        default: HandlableComponentInteractionType.UNDEFINED,
    })
    type: HandlableComponentInteractionType;

    @Column({ type: 'bigint' })
    creationTimeEpoch: number;

    @Column({ type: 'text' })
    createdBy: Snowflake;

    @Column({ type: 'int', default: 0 })
    timesHandled: number;
}
