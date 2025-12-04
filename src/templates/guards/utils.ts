import { ArgumentMetadata } from '@nestjs/common';
import { Request } from 'express';
import { EnumParamValidationPipe } from 'src/pipes/enum-param-validation.pipe';
import { TemplatesService } from 'src/templates/templates.service';
import { StructureType } from 'src/structures/entities/structure.entity';

export async function getStructureParams(
  request: Request,
  templatesService: TemplatesService,
) {
  const { id, structureType, structureId } = request.params;
  if (id) {
    const template = await templatesService.findOne(id, { structure: true });
    return template.structure;
  } else {
    validateStructureType(structureType);

    return {
      structureType,
      structureId,
    };
  }
}

const validateStructureType = (structureType: string) => {
  const validationPipe = new EnumParamValidationPipe(StructureType);
  const metadata: ArgumentMetadata = {
    type: 'param',
    data: 'structureType',
  };
  validationPipe.transform(structureType, metadata);
};
