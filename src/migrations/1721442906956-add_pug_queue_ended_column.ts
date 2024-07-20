import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPugQueueEndedColumn1721442906956 implements MigrationInterface {
    name = 'AddPugQueueEndedColumn1721442906956'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cs2_pug_queue" ADD "queueEnded" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "rcon_server" DROP CONSTRAINT "FK_60d8fc3196e57a3a972b91449b4"`);
        await queryRunner.query(`ALTER TABLE "rcon_server" ALTER COLUMN "guildId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "rcon_server" ADD CONSTRAINT "FK_60d8fc3196e57a3a972b91449b4" FOREIGN KEY ("guildId") REFERENCES "guild_settings"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "rcon_server" DROP CONSTRAINT "FK_60d8fc3196e57a3a972b91449b4"`);
        await queryRunner.query(`ALTER TABLE "rcon_server" ALTER COLUMN "guildId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "rcon_server" ADD CONSTRAINT "FK_60d8fc3196e57a3a972b91449b4" FOREIGN KEY ("guildId") REFERENCES "guild_settings"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cs2_pug_queue" DROP COLUMN "queueEnded"`);
    }

}
