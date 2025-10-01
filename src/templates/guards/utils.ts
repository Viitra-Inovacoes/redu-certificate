import { Request } from 'express';
import { TemplatesService } from 'src/templates/templates.service';

export async function getStructureParams(
  request: Request,
  templatesService: TemplatesService,
) {
  const { id } = request.params;
  if (id) {
    const template = await templatesService.findOne(id, { structure: true });
    return template.structure;
  } else {
    return {
      structureType: request.params.structureType,
      structureId: request.params.structureId,
    };
  }
}
