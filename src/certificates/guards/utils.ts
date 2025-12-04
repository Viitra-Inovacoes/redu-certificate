import {
  ArgumentMetadata,
  BadRequestException,
  ExecutionContext,
} from '@nestjs/common';
import { CertificatesService } from '../certificates.service';
import { UsersService } from 'src/users/users.service';
import { Request } from 'express';
import { StructureType } from 'src/structures/entities/structure.entity';
import { EnumParamValidationPipe } from 'src/pipes/enum-param-validation.pipe';

export async function getCertificateAuthorizationData(
  context: ExecutionContext,
  certificatesService: CertificatesService,
  usersService: UsersService,
) {
  const request = context.switchToHttp().getRequest<Request>();
  // TODO: salvar authorization token de alguma forma para evitar essa request
  const { id: reduUserId } = await usersService.getReduUser();

  const certificate = await certificatesService.findOneBy({
    where: {
      user: { reduUserId },
      ...decideWhereClause(request),
    },
    relations: { user: true },
  });

  return {
    certificate,
    reduUserId,
  };
}

function decideWhereClause(request: Request) {
  const { id, structureType, structureId } = request.params as unknown as {
    id?: string;
    structureType?: StructureType;
    structureId?: number;
  };

  if (!structureType) {
    throw new BadRequestException('structureType is required');
  }

  const validationPipe = new EnumParamValidationPipe(StructureType);
  const metadata: ArgumentMetadata = {
    type: 'param',
    data: 'structureType',
  };
  validationPipe.transform(structureType, metadata);

  if (id) {
    return { id };
  }

  return {
    template: { structure: { structureType, structureId } },
  };
}
