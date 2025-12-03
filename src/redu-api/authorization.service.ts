import { ForbiddenException, Injectable, Scope } from '@nestjs/common';
import { i18n } from 'src/i18n';
import { ReduApiError, ReduApiService } from 'src/redu-api/redu-api.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { Inject } from '@nestjs/common';

export type AuthorizeParams = {
  abilityAction: Ability;
  model: Model;
  id?: string;
};

export enum Model {
  TEMPLATE = 'template',
  CERTIFICATE = 'certificate',
  ENVIRONMENT = 'environment',
  COURSE = 'course',
  SPACE = 'space',
  BLUEPRINT = 'blueprint',
  USER = 'user',
  ALL = 'all',
}

export enum Ability {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  MANAGE = 'manage',
}

@Injectable({ scope: Scope.REQUEST })
export class ReduAuthorizationService {
  constructor(
    private readonly reduApiService: ReduApiService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async authorize(authorizeParams: AuthorizeParams): Promise<void> {
    this.logger.debug('authorize', authorizeParams);
    try {
      await this.reduApiService.get(this.buildUrl(authorizeParams));
    } catch (error) {
      if (!(error instanceof ReduApiError)) throw error;
      throw new ForbiddenException(i18n.t('error.ACCESS_DENIED'));
    }
  }

  private buildUrl(authorizeParams: AuthorizeParams): string {
    return this.reduApiService.buildUrl(
      '/v2/certificates/authorization',
      authorizeParams,
    );
  }
}
