import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { ActiveRconServer } from './activeRconServer';
import { IDatabaseModel } from '../util/databaseRepository';

@Entity()
export class UserSettings implements IDatabaseModel {
    @PrimaryColumn('text')
    id: string;

    @Column({ type: 'text', nullable: true })
    timeZoneName?: string;

    @OneToMany(() => ActiveRconServer, (activeRconServer) => activeRconServer.userSettings, { cascade: true })
    activeRconServer: ActiveRconServer[];

    @Column({ type: 'text', nullable: true })
    steamLink?: string; // This is steamID64
}
