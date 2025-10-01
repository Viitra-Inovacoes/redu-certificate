import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { i18n } from 'src/i18n';

export class CreateLogoDto {
  @ApiProperty({ type: 'string', format: 'uuid' })
  @IsUUID(7, { message: i18n.validationMessage('validation.UUID') })
  @IsNotEmpty({ message: i18n.validationMessage('validation.NOT_EMPTY') })
  templateId: string;
}
