import {
    AfterInsert,
    AfterLoad,
    AfterUpdate,
    Column,
    Entity,
    JoinColumn,
    OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Snowflake } from '../discord_api/snowflake';
import { CS2PUGGameMode } from '../enums/CS2PUGGameMode';
import { CS2PUGMapSelectionMode } from '../enums/CS2PUGMapSelectionMode';
import { Guid } from '../util/guid';
import { ComponentInteractionHandler } from './componentInteractionHandler';
import { IDatabaseModel } from '../util/databaseRepository';

@Entity()
export class CS2PugQueue implements IDatabaseModel {
    @PrimaryGeneratedColumn('uuid')
    id: Guid;

    @Column({ type: 'timestamptz' })
    queueStartTime: Date;

    @Column({ type: 'text', array: true })
    userIdsInQueue: Snowflake[];

    @Column({
        type: 'enum',
        enum: CS2PUGGameMode,
        default: CS2PUGGameMode.undefined,
    })
    gameType: CS2PUGGameMode;

    @Column({
        type: 'enum',
        enum: CS2PUGMapSelectionMode,
        default: CS2PUGMapSelectionMode.UNDEFINED,
    })
    mapSelectionMode: CS2PUGMapSelectionMode;

    @Column({ type: 'text' })
    activeChannel: Snowflake;

    @OneToOne(() => ComponentInteractionHandler, { cascade: true })
    @JoinColumn()
    stopQueueButton: ComponentInteractionHandler;

    @OneToOne(() => ComponentInteractionHandler, { cascade: true })
    @JoinColumn()
    joinQueueButton: ComponentInteractionHandler;

    @OneToOne(() => ComponentInteractionHandler, { cascade: true })
    @JoinColumn()
    leaveQueueButton: ComponentInteractionHandler;

    @OneToOne(() => ComponentInteractionHandler, { cascade: true })
    @JoinColumn()
    voteComponent: ComponentInteractionHandler;

    @Column({ type: 'simple-json', array: true })
    mapVotes: { userId: string; mapVote: string }[] = [];

    queueExpirationTime: Date;

    @AfterLoad()
    @AfterInsert()
    @AfterUpdate()
    updateQueueExpirationTime() {
        this.queueExpirationTime = new Date();
        this.queueExpirationTime.setMinutes(this.queueStartTime.getMinutes() + 15);
    }
}
