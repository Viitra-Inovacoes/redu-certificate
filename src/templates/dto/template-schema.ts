import { ApiProperty } from '@nestjs/swagger';
import { CreateTemplateDto } from './create-template.dto';

export class templateSchema extends CreateTemplateDto {
  @ApiProperty({ type: 'string', format: 'binary', required: false })
  frontBackground?: Express.Multer.File;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  backBackground?: Express.Multer.File;
}
