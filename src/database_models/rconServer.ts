import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Guid } from '../util/guid';
import { Game } from '../enums/Game';
import { GuildSettings } from './guildSettings';

@Entity()
export class RconServer {
    @PrimaryGeneratedColumn('uuid')
    id: Guid;

    @ManyToOne(() => GuildSettings, (guildSettings) => guildSettings.rconServers)
    guild: GuildSettings;

    @Column({ type: 'text' })
    nickname: string;

    @Column({ type: 'text' })
    ip: string;

    @Column({ type: 'text' })
    port: string;

    @Column({ type: 'enum', enum: Game, default: undefined })
    game: Game;

    @Column({ type: 'text' })
    rconPassword: string;

    @Column({ type: 'text' })
    countryCode: string;

    @Column({ type: 'text' })
    ftpHost: string;

    @Column({ type: 'text' })
    ftpPort: string;

    @Column({ type: 'text' })
    ftpUsername: string;

    @Column({ type: 'text' })
    ftpPassword: string;
}
