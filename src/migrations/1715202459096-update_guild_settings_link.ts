import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateGuildSettingsLink1715202459096 implements MigrationInterface {
    name = 'UpdateGuildSettingsLink1715202459096'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "playtest_request" ADD "guildId" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "scheduled_playtest" ADD "guildId" text NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "scheduled_playtest" DROP COLUMN "guildId"`);
        await queryRunner.query(`ALTER TABLE "playtest_request" DROP COLUMN "guildId"`);
    }

}
