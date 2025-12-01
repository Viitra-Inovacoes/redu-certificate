import { ApiProperty } from '@nestjs/swagger';

export class LogoSchema {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: Express.Multer.File;
}
