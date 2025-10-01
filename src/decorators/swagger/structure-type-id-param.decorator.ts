import { applyDecorators } from '@nestjs/common';
import { ApiParam } from '@nestjs/swagger';
import { StructureType } from 'src/structures/entities/structure.entity';

export const ApiStructureTypeParam = () => {
  return ApiParam({
    name: 'structureType',
    type: 'enum',
    enum: StructureType,
  });
};

export const ApiStructureIdParam = () => {
  return ApiParam({
    name: 'structureId',
    type: 'number',
  });
};

export const ApiStructureTypeIdParam = () => {
  return applyDecorators(ApiStructureTypeParam(), ApiStructureIdParam());
};
