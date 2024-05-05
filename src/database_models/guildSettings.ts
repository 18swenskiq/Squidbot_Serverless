import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Snowflake } from '../discord_api/snowflake';
import { Guid } from '../util/guid';
import { GuildPlaytestingInformation } from './guildPlaytestingInformation';
import { RconServer } from './rconServer';

@Entity()
export class GuildSettings {
    @PrimaryColumn('text')
    id: Snowflake;

    @Column({ type: 'text', array: true, default: [] })
    assignableRoles: Snowflake[];

    @OneToMany(() => RconServer, (rconServer) => rconServer.guild, { cascade: true })
    rconServers: RconServer[];

    @OneToOne(() => GuildPlaytestingInformation, (guildPI) => guildPI.guildSettings, { cascade: true })
    @JoinColumn()
    playtesting: GuildPlaytestingInformation;

    @Column({ type: 'uuid', nullable: true, default: null })
    activePlaytest: Guid | null;

    @Column({ type: 'bool', default: false })
    pugging_cs2_enabled: boolean;
}
