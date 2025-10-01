import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateSignatureDto {
  @ApiProperty({ type: 'string', format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  templateId: string;

  @ApiProperty({ type: 'string' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ type: 'string' })
  @IsString()
  @IsNotEmpty()
  role: string;
}
