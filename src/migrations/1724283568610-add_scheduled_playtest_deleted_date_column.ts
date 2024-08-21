import { MigrationInterface, QueryRunner } from "typeorm";

export class AddScheduledPlaytestDeletedDateColumn1724283568610 implements MigrationInterface {
    name = 'AddScheduledPlaytestDeletedDateColumn1724283568610'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "scheduled_playtest" ADD "deletedAt" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "scheduled_playtest" DROP COLUMN "deletedAt"`);
    }

}
