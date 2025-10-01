import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import {
  Ability,
  ReduAuthorizationService,
  Model,
} from 'src/redu-api/authorization.service';
import { getStructureParams } from 'src/templates/guards/utils';
import { TemplatesService } from 'src/templates/templates.service';

@Injectable()
export class ReadTemplateGuard implements CanActivate {
  constructor(
    private readonly authorizationService: ReduAuthorizationService,
    private readonly templatesService: TemplatesService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const { structureType, structureId } = await getStructureParams(
      request,
      this.templatesService,
    );

    await this.authorizationService.authorize({
      abilityAction: Ability.READ,
      model: structureType as Model,
      id: structureId.toString(),
    });
    return true;
  }
}
