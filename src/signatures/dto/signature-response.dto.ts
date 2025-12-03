import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

class File {
  @Expose()
  @ApiProperty({ type: 'string' })
  name: string;

  @Expose()
  @ApiProperty({ type: 'number' })
  size: number;

  @Expose()
  @ApiProperty({ type: 'string' })
  contentType: string;

  @Expose()
  @ApiProperty({ type: 'string' })
  url: string;
}

export class SignatureResponseDto {
  @ApiProperty({ type: 'string', format: 'uuid' })
  @Expose()
  id: string;

  @ApiProperty({ type: 'string' })
  @Expose()
  name: string;

  @ApiProperty({ type: 'string' })
  @Expose()
  role: string;

  @ApiProperty({ type: 'string' })
  @Expose()
  organization: string;

  @ApiProperty({ type: File })
  @Type(() => File)
  @Expose()
  file: File;
}
