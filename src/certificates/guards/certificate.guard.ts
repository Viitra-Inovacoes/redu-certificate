import { UseGuards } from '@nestjs/common';
import { CreateCertificateGuard } from 'src/certificates/guards/create.guard';
import { ManageCertificateGuard } from 'src/certificates/guards/manage.guard';
import { Ability } from 'src/redu-api/authorization.service';

export const CertificateGuard = (action: Ability) => {
  switch (action) {
    case Ability.CREATE:
      return UseGuards(CreateCertificateGuard);
    case Ability.MANAGE:
      return UseGuards(ManageCertificateGuard);
    default:
      throw new Error(`Invalid action: ${action}`);
  }
};
