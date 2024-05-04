import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCascadeSave1714853845629 implements MigrationInterface {
    name = 'AddCascadeSave1714853845629'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "cs2_playtesting_information" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "enabled" boolean NOT NULL, "requestChannel" text NOT NULL, "announceChannel" text NOT NULL, "playtestChannel" text NOT NULL, "competitiveChannel" text NOT NULL, CONSTRAINT "PK_d1204073ec6703005551639a9d3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "guild_playtesting_information" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "cs2Id" uuid, CONSTRAINT "REL_4263fc51e86de9892a83d7d4d3" UNIQUE ("cs2Id"), CONSTRAINT "PK_4275ec16fe5a24b9bbb3ba02489" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "guild_settings" ("id" text NOT NULL, "assignableRoles" text array NOT NULL, "activePlaytest" uuid, "pugging_cs2_enabled" boolean NOT NULL DEFAULT false, "playtestingId" uuid, CONSTRAINT "REL_df899b6ec12ea3db394bf57b80" UNIQUE ("playtestingId"), CONSTRAINT "PK_259bd839beb2830fe5c2ddd2ff5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."rcon_server_game_enum" AS ENUM('undefined', 'cs2')`);
        await queryRunner.query(`CREATE TABLE "rcon_server" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nickname" text NOT NULL, "ip" text NOT NULL, "port" text NOT NULL, "game" "public"."rcon_server_game_enum" NOT NULL, "rconPassword" text NOT NULL, "countryCode" text NOT NULL, "ftpHost" text NOT NULL, "ftpPort" text NOT NULL, "ftpUsername" text NOT NULL, "ftpPassword" text NOT NULL, "guildId" text, CONSTRAINT "PK_5d3c21d0a9a27ae1a61d447fec5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_settings" ("id" text NOT NULL, "timeZoneName" text, "steamLink" text, CONSTRAINT "PK_00f004f5922a0744d174530d639" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "active_rcon_server" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "guildId" text NOT NULL, "rconServerId" uuid, "userSettingsId" text, CONSTRAINT "REL_f6db09589d174d069bd21f609a" UNIQUE ("rconServerId"), CONSTRAINT "PK_3f7ece51752896efa394c96f4d1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."component_interaction_handler_type_enum" AS ENUM('undefined', 'AssignRoles', 'StopPUG', 'JoinPUG', 'LeavePUG', 'PUGMapVote')`);
        await queryRunner.query(`CREATE TABLE "component_interaction_handler" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" "public"."component_interaction_handler_type_enum" NOT NULL DEFAULT 'undefined', "creationTimeEpoch" bigint NOT NULL, "createdBy" text NOT NULL, "timesHandled" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_3efa352b72eaf8153b56c1112ff" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."cs2_pug_queue_gametype_enum" AS ENUM('undefined', 'wingman', 'threesome', 'classic', 'arena')`);
        await queryRunner.query(`CREATE TYPE "public"."cs2_pug_queue_mapselectionmode_enum" AS ENUM('undefined', 'random', 'allpick')`);
        await queryRunner.query(`CREATE TABLE "cs2_pug_queue" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "queueStartTime" TIMESTAMP WITH TIME ZONE NOT NULL, "userIdsInQueue" text array NOT NULL, "gameType" "public"."cs2_pug_queue_gametype_enum" NOT NULL DEFAULT 'undefined', "mapSelectionMode" "public"."cs2_pug_queue_mapselectionmode_enum" NOT NULL DEFAULT 'undefined', "activeChannel" text NOT NULL, "mapVotes" text array NOT NULL, "stopQueueButtonId" uuid, "joinQueueButtonId" uuid, "leaveQueueButtonId" uuid, "voteComponentId" uuid, CONSTRAINT "REL_1651a25de9c942399420e2a775" UNIQUE ("stopQueueButtonId"), CONSTRAINT "REL_44ca9d164d4d3665df3f97a3f9" UNIQUE ("joinQueueButtonId"), CONSTRAINT "REL_4f5cced21d6371a892c490055a" UNIQUE ("leaveQueueButtonId"), CONSTRAINT "REL_301b030b8127bca5ee40914d24" UNIQUE ("voteComponentId"), CONSTRAINT "PK_a6ab0191ee98a5f513e4adb1c2b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."playtest_request_game_enum" AS ENUM('undefined', 'cs2')`);
        await queryRunner.query(`CREATE TYPE "public"."playtest_request_maptype_enum" AS ENUM('undefined', 'defuse', 'hostage')`);
        await queryRunner.query(`CREATE TYPE "public"."playtest_request_playtesttype_enum" AS ENUM('undefined', '2v2', '5v5', '10v10')`);
        await queryRunner.query(`CREATE TABLE "playtest_request" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "game" "public"."playtest_request_game_enum" NOT NULL DEFAULT 'undefined', "mapName" text NOT NULL, "mainAuthor" text NOT NULL, "otherAuthors" text array NOT NULL DEFAULT '{}', "thumbnailImage" text NOT NULL, "requestDate" text NOT NULL, "requestTime" text NOT NULL, "workshopId" text NOT NULL, "mapType" "public"."playtest_request_maptype_enum" NOT NULL DEFAULT 'undefined', "playtestType" "public"."playtest_request_playtesttype_enum" NOT NULL DEFAULT 'undefined', "dateSubmitted" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_b67ab1a34462ebf97fbeadc1b76" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."scheduled_playtest_game_enum" AS ENUM('undefined', 'cs2')`);
        await queryRunner.query(`CREATE TYPE "public"."scheduled_playtest_maptype_enum" AS ENUM('undefined', 'defuse', 'hostage')`);
        await queryRunner.query(`CREATE TYPE "public"."scheduled_playtest_playtesttype_enum" AS ENUM('undefined', '2v2', '5v5', '10v10')`);
        await queryRunner.query(`CREATE TABLE "scheduled_playtest" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "game" "public"."scheduled_playtest_game_enum" NOT NULL DEFAULT 'undefined', "mapName" text NOT NULL, "mainAuthor" text NOT NULL, "otherAuthors" text array NOT NULL, "thumbnailImage" text NOT NULL, "playtestTime" TIMESTAMP WITH TIME ZONE NOT NULL, "workshopId" text NOT NULL, "mapType" "public"."scheduled_playtest_maptype_enum" NOT NULL DEFAULT 'undefined', "playtestType" "public"."scheduled_playtest_playtesttype_enum" NOT NULL DEFAULT 'undefined', "moderator" text NOT NULL, "eventId" text NOT NULL, "serverId" uuid, CONSTRAINT "REL_4eee562463aed0748ed819d293" UNIQUE ("serverId"), CONSTRAINT "PK_2b3e3a8577b2f4761952615b0c9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "guild_playtesting_information" ADD CONSTRAINT "FK_4263fc51e86de9892a83d7d4d31" FOREIGN KEY ("cs2Id") REFERENCES "cs2_playtesting_information"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "guild_settings" ADD CONSTRAINT "FK_df899b6ec12ea3db394bf57b801" FOREIGN KEY ("playtestingId") REFERENCES "guild_playtesting_information"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "rcon_server" ADD CONSTRAINT "FK_60d8fc3196e57a3a972b91449b4" FOREIGN KEY ("guildId") REFERENCES "guild_settings"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "active_rcon_server" ADD CONSTRAINT "FK_f6db09589d174d069bd21f609a0" FOREIGN KEY ("rconServerId") REFERENCES "rcon_server"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "active_rcon_server" ADD CONSTRAINT "FK_a1e8aeff737178219eea8621f6e" FOREIGN KEY ("userSettingsId") REFERENCES "user_settings"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cs2_pug_queue" ADD CONSTRAINT "FK_1651a25de9c942399420e2a7750" FOREIGN KEY ("stopQueueButtonId") REFERENCES "component_interaction_handler"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cs2_pug_queue" ADD CONSTRAINT "FK_44ca9d164d4d3665df3f97a3f9e" FOREIGN KEY ("joinQueueButtonId") REFERENCES "component_interaction_handler"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cs2_pug_queue" ADD CONSTRAINT "FK_4f5cced21d6371a892c490055a0" FOREIGN KEY ("leaveQueueButtonId") REFERENCES "component_interaction_handler"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cs2_pug_queue" ADD CONSTRAINT "FK_301b030b8127bca5ee40914d24e" FOREIGN KEY ("voteComponentId") REFERENCES "component_interaction_handler"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "scheduled_playtest" ADD CONSTRAINT "FK_4eee562463aed0748ed819d293b" FOREIGN KEY ("serverId") REFERENCES "rcon_server"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "scheduled_playtest" DROP CONSTRAINT "FK_4eee562463aed0748ed819d293b"`);
        await queryRunner.query(`ALTER TABLE "cs2_pug_queue" DROP CONSTRAINT "FK_301b030b8127bca5ee40914d24e"`);
        await queryRunner.query(`ALTER TABLE "cs2_pug_queue" DROP CONSTRAINT "FK_4f5cced21d6371a892c490055a0"`);
        await queryRunner.query(`ALTER TABLE "cs2_pug_queue" DROP CONSTRAINT "FK_44ca9d164d4d3665df3f97a3f9e"`);
        await queryRunner.query(`ALTER TABLE "cs2_pug_queue" DROP CONSTRAINT "FK_1651a25de9c942399420e2a7750"`);
        await queryRunner.query(`ALTER TABLE "active_rcon_server" DROP CONSTRAINT "FK_a1e8aeff737178219eea8621f6e"`);
        await queryRunner.query(`ALTER TABLE "active_rcon_server" DROP CONSTRAINT "FK_f6db09589d174d069bd21f609a0"`);
        await queryRunner.query(`ALTER TABLE "rcon_server" DROP CONSTRAINT "FK_60d8fc3196e57a3a972b91449b4"`);
        await queryRunner.query(`ALTER TABLE "guild_settings" DROP CONSTRAINT "FK_df899b6ec12ea3db394bf57b801"`);
        await queryRunner.query(`ALTER TABLE "guild_playtesting_information" DROP CONSTRAINT "FK_4263fc51e86de9892a83d7d4d31"`);
        await queryRunner.query(`DROP TABLE "scheduled_playtest"`);
        await queryRunner.query(`DROP TYPE "public"."scheduled_playtest_playtesttype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."scheduled_playtest_maptype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."scheduled_playtest_game_enum"`);
        await queryRunner.query(`DROP TABLE "playtest_request"`);
        await queryRunner.query(`DROP TYPE "public"."playtest_request_playtesttype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."playtest_request_maptype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."playtest_request_game_enum"`);
        await queryRunner.query(`DROP TABLE "cs2_pug_queue"`);
        await queryRunner.query(`DROP TYPE "public"."cs2_pug_queue_mapselectionmode_enum"`);
        await queryRunner.query(`DROP TYPE "public"."cs2_pug_queue_gametype_enum"`);
        await queryRunner.query(`DROP TABLE "component_interaction_handler"`);
        await queryRunner.query(`DROP TYPE "public"."component_interaction_handler_type_enum"`);
        await queryRunner.query(`DROP TABLE "active_rcon_server"`);
        await queryRunner.query(`DROP TABLE "user_settings"`);
        await queryRunner.query(`DROP TABLE "rcon_server"`);
        await queryRunner.query(`DROP TYPE "public"."rcon_server_game_enum"`);
        await queryRunner.query(`DROP TABLE "guild_settings"`);
        await queryRunner.query(`DROP TABLE "guild_playtesting_information"`);
        await queryRunner.query(`DROP TABLE "cs2_playtesting_information"`);
    }

}
