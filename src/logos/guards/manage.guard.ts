import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import {
  Ability,
  ReduAuthorizationService,
  Model,
} from 'src/redu-api/authorization.service';
import { TemplatesService } from 'src/templates/templates.service';

@Injectable()
export class ManageLogoGuard implements CanActivate {
  constructor(
    private readonly authorizationService: ReduAuthorizationService,
    private readonly templatesService: TemplatesService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const { templateId } = request.params;
    const template = await this.templatesService.findOneBy({
      where: { id: templateId },
      relations: { structure: true },
    });

    await this.authorizationService.authorize({
      abilityAction: Ability.MANAGE,
      model: template.structure.structureType as unknown as Model,
      id: template.structure.structureId.toString(),
    });
    return true;
  }
}
