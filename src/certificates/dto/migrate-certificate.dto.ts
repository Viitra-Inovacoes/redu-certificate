import { Type } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';
import { TransformJson } from 'src/decorators/transform-json.decorator';
import { StructureType } from 'src/structures/entities/structure.entity';

class User {
  reduUserId: number;
  name: string;
  email: string;
  cpf: string;
  description: string;
}

class Structure {
  structureType: StructureType;
  structureId: number;
  name: string;
}

class Certificate {
  validationCode: string;
  createdAt: Date;
  workload: number;
}

export class MigrateCertificateDto {
  @TransformJson(User)
  @Type(() => User)
  @IsNotEmpty()
  user: User;

  @TransformJson(Structure)
  @Type(() => Structure)
  @IsNotEmpty()
  structure: Structure;

  @TransformJson(Certificate)
  @Type(() => Certificate)
  @IsNotEmpty()
  certificate: Certificate;
}
