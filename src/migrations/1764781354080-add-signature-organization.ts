import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSignatureOrganization1764781354080
  implements MigrationInterface
{
  name = 'AddSignatureOrganization1764781354080';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "signatures" ADD "organization" character varying NOT NULL DEFAULT ''`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "signatures" DROP COLUMN "organization"`,
    );
  }
}
