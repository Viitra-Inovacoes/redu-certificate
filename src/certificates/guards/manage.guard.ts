import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { getCertificateAuthorizationData } from './utils';
import { CertificatesService } from '../certificates.service';

@Injectable()
export class ManageCertificateGuard implements CanActivate {
  constructor(
    private readonly usersService: UsersService,
    private readonly certificatesService: CertificatesService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const { certificate, reduUserId } = await getCertificateAuthorizationData(
        context,
        this.certificatesService,
        this.usersService,
      );

      return certificate.user.reduUserId === reduUserId;
    } catch (error) {
      if (error instanceof NotFoundException) return true;
      throw error;
    }
  }
}
