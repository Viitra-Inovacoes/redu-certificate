import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';
import {
  Ability,
  ReduAuthorizationService,
  Model,
} from 'src/redu-api/authorization.service';
import { UsersService } from 'src/users/users.service';
import { getCertificateAuthorizationData } from './utils';
import { CertificatesService } from '../certificates.service';

@Injectable()
export class ManageCertificateGuard implements CanActivate {
  constructor(
    private readonly authorizationService: ReduAuthorizationService,
    private readonly certificatesService: CertificatesService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const { certificate, reduUserId } = await getCertificateAuthorizationData(
        context,
        this.certificatesService,
        this.usersService,
      );

      const isCertificateOwner = certificate.user.reduUserId === reduUserId;
      if (isCertificateOwner) return true;

      await this.authorizationService.authorize({
        abilityAction: Ability.READ,
        model: Model.USER,
        id: reduUserId.toString(),
      });

      return true;
    } catch (error) {
      if (error instanceof NotFoundException) return true;
      throw error;
    }
  }
}
