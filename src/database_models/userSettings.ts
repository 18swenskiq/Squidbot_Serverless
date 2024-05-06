import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { ActiveRconServer } from './activeRconServer';

@Entity()
export class UserSettings {
    @PrimaryColumn('text')
    id: string;

    @Column({ type: 'text', nullable: true })
    timeZoneName?: string;

    @OneToMany(() => ActiveRconServer, (activeRconServer) => activeRconServer.userSettings, { cascade: true })
    activeRconServer: ActiveRconServer[];

    @Column({ type: 'text', nullable: true })
    steamLink?: string; // This is steamID64
}
