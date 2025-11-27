import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1764175971041 implements MigrationInterface {
  name = 'Init1764175971041';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."structures_structuretype_enum" AS ENUM('environment', 'course', 'space')`,
    );
    await queryRunner.query(
      `CREATE TABLE "structures" ("id" uuid NOT NULL DEFAULT uuidv7(), "clientId" uuid NOT NULL, "name" character varying NOT NULL, "structureType" "public"."structures_structuretype_enum" NOT NULL, "structureId" integer NOT NULL, CONSTRAINT "PK_392d41b28d3ff6c67a9a93c9800" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_8615f526f2dfd36ed9e18dc1f5" ON "structures" ("clientId", "structureType", "structureId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "clients" ("id" uuid NOT NULL DEFAULT uuidv7(), "name" character varying NOT NULL, "blueprintId" uuid, CONSTRAINT "UQ_99e921caf21faa2aab020476e44" UNIQUE ("name"), CONSTRAINT "PK_f1ab7cf3a5714dbc6bb4e1c28a4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "blueprints" ("id" uuid NOT NULL DEFAULT uuidv7(), "name" character varying NOT NULL, CONSTRAINT "PK_066be3e934e709891367360aec3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "logos" ("id" uuid NOT NULL DEFAULT uuidv7(), "templateId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_31b54869640913345a8087adf13" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_67079fc6c572ea3c5e61614bb2" ON "logos" ("templateId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "signatures" ("id" uuid NOT NULL DEFAULT uuidv7(), "templateId" uuid NOT NULL, "name" character varying NOT NULL, "role" character varying NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_f56eb3cd344ce7f9ae28ce814eb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e22a8748b8d84e103ee1788277" ON "signatures" ("templateId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "templates" ("id" uuid NOT NULL DEFAULT uuidv7(), "blueprintId" uuid NOT NULL, "structureId" uuid, "finished" boolean NOT NULL DEFAULT false, "generationEnabled" boolean NOT NULL DEFAULT true, "downloadButtonLabel" character varying, "front" jsonb, "back" jsonb, "requirements" jsonb, "metadata" jsonb, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "REL_25aaee3c7ea0b28f6d56594db8" UNIQUE ("structureId"), CONSTRAINT "PK_515948649ce0bbbe391de702ae5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_25aaee3c7ea0b28f6d56594db8" ON "templates" ("structureId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5f6aa59a652dfc47709eac71d4" ON "templates" ("blueprintId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "certificates" ("id" uuid NOT NULL DEFAULT uuidv7(), "templateId" uuid NOT NULL, "validationCode" character varying NOT NULL, "userId" uuid NOT NULL, "migrated" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_0ffa09dbc85da79f023e3cef7fe" UNIQUE ("validationCode"), CONSTRAINT "PK_e4c7e31e2144300bea7d89eb165" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_4a0a01a8008543f68d962d96e1" ON "certificates" ("templateId", "userId") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_743e15a3ce7019ced4f0772c0f" ON "certificates" ("validationCode", "templateId") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_0ffa09dbc85da79f023e3cef7f" ON "certificates" ("validationCode") `,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuidv7(), "clientId" uuid NOT NULL, "reduUserId" integer NOT NULL, "name" character varying NOT NULL, "cpf" character varying, "email" character varying, "description" character varying, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_459312150f1a42658ab66a8f44" ON "users" ("reduUserId", "clientId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "structures" ADD CONSTRAINT "FK_bda1a81e8d5dc365b8ceec340c8" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "clients" ADD CONSTRAINT "FK_fa835a73bc3f5e3cc69325ec85c" FOREIGN KEY ("blueprintId") REFERENCES "blueprints"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "logos" ADD CONSTRAINT "FK_67079fc6c572ea3c5e61614bb2f" FOREIGN KEY ("templateId") REFERENCES "templates"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "signatures" ADD CONSTRAINT "FK_e22a8748b8d84e103ee17882775" FOREIGN KEY ("templateId") REFERENCES "templates"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "templates" ADD CONSTRAINT "FK_5f6aa59a652dfc47709eac71d4b" FOREIGN KEY ("blueprintId") REFERENCES "blueprints"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "templates" ADD CONSTRAINT "FK_25aaee3c7ea0b28f6d56594db8f" FOREIGN KEY ("structureId") REFERENCES "structures"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "certificates" ADD CONSTRAINT "FK_03fc255c16c0770ed70a9563aa2" FOREIGN KEY ("templateId") REFERENCES "templates"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "certificates" ADD CONSTRAINT "FK_7d072194aef1ecb98664c83e861" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_6c3a73bbc9d8a8082816adc870e" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_6c3a73bbc9d8a8082816adc870e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "certificates" DROP CONSTRAINT "FK_7d072194aef1ecb98664c83e861"`,
    );
    await queryRunner.query(
      `ALTER TABLE "certificates" DROP CONSTRAINT "FK_03fc255c16c0770ed70a9563aa2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "templates" DROP CONSTRAINT "FK_25aaee3c7ea0b28f6d56594db8f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "templates" DROP CONSTRAINT "FK_5f6aa59a652dfc47709eac71d4b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "signatures" DROP CONSTRAINT "FK_e22a8748b8d84e103ee17882775"`,
    );
    await queryRunner.query(
      `ALTER TABLE "logos" DROP CONSTRAINT "FK_67079fc6c572ea3c5e61614bb2f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "clients" DROP CONSTRAINT "FK_fa835a73bc3f5e3cc69325ec85c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "structures" DROP CONSTRAINT "FK_bda1a81e8d5dc365b8ceec340c8"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_459312150f1a42658ab66a8f44"`,
    );
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0ffa09dbc85da79f023e3cef7f"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_743e15a3ce7019ced4f0772c0f"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4a0a01a8008543f68d962d96e1"`,
    );
    await queryRunner.query(`DROP TABLE "certificates"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5f6aa59a652dfc47709eac71d4"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_25aaee3c7ea0b28f6d56594db8"`,
    );
    await queryRunner.query(`DROP TABLE "templates"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e22a8748b8d84e103ee1788277"`,
    );
    await queryRunner.query(`DROP TABLE "signatures"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_67079fc6c572ea3c5e61614bb2"`,
    );
    await queryRunner.query(`DROP TABLE "logos"`);
    await queryRunner.query(`DROP TABLE "blueprints"`);
    await queryRunner.query(`DROP TABLE "clients"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8615f526f2dfd36ed9e18dc1f5"`,
    );
    await queryRunner.query(`DROP TABLE "structures"`);
    await queryRunner.query(
      `DROP TYPE "public"."structures_structuretype_enum"`,
    );
  }
}
