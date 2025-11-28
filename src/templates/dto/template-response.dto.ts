import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { LogoResponseDto } from 'src/logos/dto/logo-response.dto';
import { SignatureResponseDto } from 'src/signatures/dto/signature-response.dto';
import {
  BackContentType,
  EnrollmentTimeType,
  GradeType,
} from 'src/templates/entities/template.entity';

class File {
  @ApiProperty({ type: 'string' })
  @Expose()
  name: string;

  @ApiProperty({ type: 'number' })
  @Expose()
  size: number;

  @ApiProperty({ type: 'string' })
  @Expose()
  contentType: string;

  @ApiProperty({ type: 'string' })
  @Expose()
  url: string;
}
class Grade {
  @ApiProperty({
    type: 'string',
    enum: GradeType,
  })
  @Expose()
  type: GradeType;

  @ApiProperty({ type: 'number' })
  @Expose()
  id?: number;

  @ApiProperty({ type: 'number' })
  @Expose()
  value: number;
}

class EnrollmentTime {
  @ApiProperty({
    type: 'string',
    enum: EnrollmentTimeType,
  })
  @Expose()
  type: EnrollmentTimeType;

  @ApiProperty({ type: 'number' })
  @Expose()
  value: number;
}

class Requirements {
  @ApiProperty({ type: 'string', format: 'date-time' })
  @Type(() => Date)
  @Expose()
  afterDate?: Date;

  @ApiProperty({ type: 'number' })
  @Expose()
  presence?: number;

  @ApiProperty({ type: 'number' })
  @Expose()
  progress?: number;

  @ApiProperty({ type: Grade })
  @Type(() => Grade)
  @Expose()
  grade: Grade;

  @ApiProperty({ type: EnrollmentTime })
  @Type(() => EnrollmentTime)
  @Expose()
  enrollmentTime: EnrollmentTime;
}

class Front {
  @ApiProperty({ type: 'string' })
  @Expose()
  title: string;

  @ApiProperty({ type: 'string' })
  @Expose()
  organization: string;

  @ApiProperty({ type: 'number' })
  @Expose()
  workload: number;

  @ApiProperty({ type: 'boolean' })
  @Expose()
  sumPresenceWorkload: boolean;

  @ApiProperty({ type: 'string', format: 'date-time' })
  @Type(() => Date)
  @Expose()
  startDate?: Date;

  @ApiProperty({ type: 'string', format: 'date-time' })
  @Type(() => Date)
  @Expose()
  endDate?: Date;

  @ApiProperty({ type: 'string' })
  @Expose()
  info: string;

  @ApiProperty({ type: File })
  @Type(() => File)
  @Expose()
  background?: File;
}

class BackContent {
  @ApiProperty({
    type: 'string',
    enum: BackContentType,
  })
  @Expose()
  type: BackContentType;

  @ApiProperty({ type: 'string' })
  @Expose()
  value: string;
}

class Back {
  @ApiProperty({ type: 'string' })
  @Expose()
  title: string;

  @ApiProperty({ type: 'string' })
  @Expose()
  subtitle: string;

  @ApiProperty({ type: 'string' })
  @Expose()
  footer: string;

  @ApiProperty({ type: BackContent })
  @Type(() => BackContent)
  @Expose()
  content: BackContent;

  @ApiProperty({ type: File })
  @Type(() => File)
  @Expose()
  background?: File;
}

export class MetadataCustomBackground {
  @ApiProperty({ type: 'boolean' })
  @Expose()
  front?: boolean;

  @ApiProperty({ type: 'boolean' })
  @Expose()
  back?: boolean;
}

export class Metadata {
  @ApiProperty({ type: 'boolean' })
  @Expose()
  hasBackPage?: boolean;

  @ApiProperty({ type: MetadataCustomBackground })
  @Type(() => MetadataCustomBackground)
  @Expose()
  customBackground?: MetadataCustomBackground;
}

export class TemplateResponseDto {
  @ApiProperty({ type: 'string', format: 'uuid' })
  @Expose()
  id: string;

  @ApiProperty({ type: 'boolean' })
  @Expose()
  generationEnabled: boolean;

  @ApiProperty({ type: 'string' })
  @Expose()
  downloadButtonLabel?: string;

  @ApiProperty({ type: Front, required: false })
  @Type(() => Front)
  @Expose()
  front?: Front;

  @ApiProperty({ type: Back, required: false })
  @Type(() => Back)
  @Expose()
  back?: Back;

  @ApiProperty({ type: SignatureResponseDto })
  @Type(() => SignatureResponseDto)
  @Expose()
  signatures: SignatureResponseDto[];

  @ApiProperty({ type: LogoResponseDto })
  @Type(() => LogoResponseDto)
  @Expose()
  logos: LogoResponseDto[];

  @ApiProperty({ type: Requirements, required: false })
  @Type(() => Requirements)
  @Expose()
  requirements?: Requirements;

  @ApiProperty({ type: Metadata })
  @Type(() => Metadata)
  @Expose()
  metadata: Metadata;
}
