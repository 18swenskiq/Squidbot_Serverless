import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPugQueueEndedColumn1724281492602 implements MigrationInterface {
    name = 'AddPugQueueEndedColumn1724281492602'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "playtest_request" ADD "deletedAt" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "playtest_request" DROP COLUMN "deletedAt"`);
    }

}
