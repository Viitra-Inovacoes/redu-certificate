import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserAvatar1764343014947 implements MigrationInterface {
  name = 'AddUserAvatar1764343014947';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "avatar" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "avatar"`);
  }
}
