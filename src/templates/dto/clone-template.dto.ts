import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { i18n } from 'src/i18n';
import { StructureType } from 'src/structures/entities/structure.entity';

export class Structure {
  @ApiProperty({ enum: Object.values(StructureType), required: true })
  @IsString()
  @IsNotEmpty()
  @IsEnum(StructureType)
  structureType: StructureType;

  @ApiProperty({ type: 'number', required: true })
  @IsNumber()
  @IsNotEmpty()
  structureId: number;
}

export class CloneTemplateDto {
  @ApiProperty({
    type: 'array',
    items: {
      type: 'object',
      properties: {
        structureType: { type: 'string', enum: Object.values(StructureType) },
        structureId: { type: 'number' },
      },
      required: ['structureType', 'structureId'],
    },
    required: true,
  })
  @IsArray()
  @IsNotEmpty({ message: i18n.validationMessage('validation.NOT_EMPTY') })
  @ValidateNested({ each: true })
  @Type(() => Structure)
  structures: Structure[];
}
