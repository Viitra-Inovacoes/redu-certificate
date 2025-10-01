import { ApiProperty } from '@nestjs/swagger';
import { CreateBlueprintDto } from './create-blueprint.dto';

export class BlueprintSchema extends CreateBlueprintDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  front: Express.Multer.File;

  @ApiProperty({ type: 'string', format: 'binary' })
  backSmall: Express.Multer.File;

  @ApiProperty({ type: 'string', format: 'binary' })
  backLarge: Express.Multer.File;

  @ApiProperty({ type: 'string', format: 'binary' })
  frontBackground: Express.Multer.File;

  @ApiProperty({ type: 'string', format: 'binary' })
  backBackground: Express.Multer.File;
}
