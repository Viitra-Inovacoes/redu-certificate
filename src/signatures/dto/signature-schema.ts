import { ApiProperty } from '@nestjs/swagger';
import { CreateSignatureDto } from './create-signature.dto';

export class SignatureSchema extends CreateSignatureDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: Express.Multer.File;
}
