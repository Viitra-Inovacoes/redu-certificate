import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { i18n } from 'src/i18n';

export class CreateBlueprintDto {
  @ApiProperty({ type: 'string' })
  @IsString({ message: i18n.validationMessage('validation.STRING') })
  @IsNotEmpty({ message: i18n.validationMessage('validation.NOT_EMPTY') })
  name: string;
}
