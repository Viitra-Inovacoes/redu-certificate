import { ApiProperty } from '@nestjs/swagger';
import { CreateLogoDto } from './create-logo.dto';

export class LogoSchema extends CreateLogoDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: Express.Multer.File;
}
