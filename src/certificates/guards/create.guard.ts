import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { RequirementsService } from 'src/certificates/requirements.service';
import { StructureType } from 'src/structures/entities/structure.entity';
import { TemplatesService } from 'src/templates/templates.service';

@Injectable()
export class CreateCertificateGuard implements CanActivate {
  constructor(
    private readonly requirementsService: RequirementsService,
    private readonly templatesService: TemplatesService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const template = await this.getTemplate(context);
    return this.requirementsService.canGenerate(template);
  }

  async getTemplate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const { structureType, structureId } = request.params;
    const template = await this.templatesService.findOneByStructure(
      structureType as StructureType,
      Number(structureId),
      {
        relations: { structure: true },
      },
    );

    return template;
  }
}
