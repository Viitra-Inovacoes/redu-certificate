import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
  IsDate,
} from 'class-validator';
import { TransformBoolean } from 'src/decorators/transform-boolean.decorator';
import { TransformJson } from 'src/decorators/transform-json.decorator';
import { i18n } from 'src/i18n';
import {
  BackContentType,
  EnrollmentTimeType,
  GradeType,
} from 'src/templates/entities/template.entity';

class Grade {
  @ApiProperty({
    type: 'string',
    enum: GradeType,
  })
  @IsEnum(GradeType, {
    message: i18n.validationMessage('validation.ENUM', {
      values: Object.values(GradeType).join(', '),
    }),
  })
  @IsNotEmpty({ message: i18n.validationMessage('validation.NOT_EMPTY') })
  type: GradeType;

  @ApiProperty({ type: 'number' })
  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: i18n.validationMessage('validation.NUMBER') },
  )
  @IsOptional()
  id?: number;

  @ApiProperty({ type: 'number' })
  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: i18n.validationMessage('validation.NUMBER') },
  )
  @IsNotEmpty({ message: i18n.validationMessage('validation.NOT_EMPTY') })
  value: number;
}

class EnrollmentTime {
  @ApiProperty({
    type: 'string',
    enum: EnrollmentTimeType,
  })
  @IsEnum(EnrollmentTimeType, {
    message: i18n.validationMessage('validation.ENUM', {
      values: Object.values(EnrollmentTimeType).join(', '),
    }),
  })
  @IsNotEmpty({ message: i18n.validationMessage('validation.NOT_EMPTY') })
  type: EnrollmentTimeType;

  @ApiProperty({ type: 'number' })
  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: i18n.validationMessage('validation.NUMBER') },
  )
  @IsNotEmpty({ message: i18n.validationMessage('validation.NOT_EMPTY') })
  value: number;
}

class Requirements {
  @ApiProperty({ type: 'string', format: 'date-time' })
  @Type(() => Date)
  @IsDate({ message: i18n.validationMessage('validation.DATE') })
  @IsOptional()
  afterDate?: Date;

  @ApiProperty({ type: 'number' })
  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: i18n.validationMessage('validation.NUMBER') },
  )
  @IsOptional()
  presence?: number;

  @ApiProperty({ type: 'number' })
  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: i18n.validationMessage('validation.NUMBER') },
  )
  @IsOptional()
  progress?: number;

  @ApiProperty({ type: Grade })
  @Type(() => Grade)
  @TransformJson(Grade)
  @IsOptional()
  @ValidateNested()
  grade: Grade;

  @ApiProperty({ type: EnrollmentTime })
  @Type(() => EnrollmentTime)
  @TransformJson(EnrollmentTime)
  @IsOptional()
  @ValidateNested()
  enrollmentTime: EnrollmentTime;
}

class Front {
  @ApiProperty({ type: 'string' })
  @IsString({ message: i18n.validationMessage('validation.STRING') })
  @IsOptional()
  title: string;

  @ApiProperty({ type: 'string' })
  @IsString({ message: i18n.validationMessage('validation.STRING') })
  @IsOptional()
  organization: string;

  @ApiProperty({ type: 'number' })
  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: i18n.validationMessage('validation.NUMBER') },
  )
  @IsOptional()
  workload: number;

  @ApiProperty({ type: 'boolean' })
  @TransformBoolean()
  @IsBoolean()
  @IsOptional()
  sumPresenceWorkload: boolean;

  @ApiProperty({ type: 'string', format: 'date-time' })
  @Type(() => Date)
  @IsDate({ message: i18n.validationMessage('validation.DATE') })
  @IsOptional()
  startDate?: Date;

  @ApiProperty({ type: 'string', format: 'date-time' })
  @Type(() => Date)
  @IsDate({ message: i18n.validationMessage('validation.DATE') })
  @IsOptional()
  endDate?: Date;

  @ApiProperty({ type: 'string' })
  @IsString({ message: i18n.validationMessage('validation.STRING') })
  @IsNotEmpty()
  info: string;
}

class BackContent {
  @ApiProperty({
    type: 'string',
    enum: BackContentType,
  })
  @IsEnum(BackContentType, {
    message: i18n.validationMessage('validation.ENUM', {
      values: Object.values(BackContentType).join(', '),
    }),
  })
  @IsNotEmpty({ message: i18n.validationMessage('validation.NOT_EMPTY') })
  type: BackContentType;

  @ApiProperty({ type: 'string' })
  @IsString({ message: i18n.validationMessage('validation.STRING') })
  @IsOptional()
  value: string;
}

class Back {
  @ApiProperty({ type: 'string' })
  @IsString({ message: i18n.validationMessage('validation.STRING') })
  @IsOptional()
  title: string;

  @ApiProperty({ type: 'string' })
  @IsString({ message: i18n.validationMessage('validation.STRING') })
  @IsOptional()
  subtitle: string;

  @ApiProperty({ type: 'string' })
  @IsString({ message: i18n.validationMessage('validation.STRING') })
  @IsOptional()
  footer: string;

  @ApiProperty({ type: BackContent })
  @Type(() => BackContent)
  @TransformJson(BackContent)
  @IsNotEmpty({ message: i18n.validationMessage('validation.NOT_EMPTY') })
  @ValidateNested()
  content: BackContent;
}

export class MetadataCustomBackground {
  @ApiProperty({ type: 'boolean' })
  @TransformBoolean()
  @IsBoolean()
  @IsOptional()
  front?: boolean;

  @ApiProperty({ type: 'boolean' })
  @TransformBoolean()
  @IsBoolean()
  @IsOptional()
  back?: boolean;
}

export class Metadata {
  @ApiProperty({ type: 'boolean' })
  @TransformBoolean()
  @IsBoolean()
  @IsOptional()
  hasBackPage?: boolean;

  @ApiProperty({ type: MetadataCustomBackground })
  @Type(() => MetadataCustomBackground)
  @TransformJson(MetadataCustomBackground)
  @IsOptional()
  @ValidateNested()
  customBackground?: MetadataCustomBackground;
}

export class CreateTemplateDto {
  @ApiProperty({ type: 'boolean' })
  @TransformBoolean()
  @IsOptional()
  generationEnabled?: boolean;

  @ApiProperty({ type: 'string' })
  @IsString({ message: i18n.validationMessage('validation.STRING') })
  @IsOptional()
  downloadButtonLabel?: string;

  @ApiProperty({ type: Front, required: false })
  @Type(() => Front)
  @TransformJson(Front)
  @IsOptional()
  @ValidateNested()
  front?: Partial<Front>;

  @ApiProperty({ type: Back, required: false })
  @Type(() => Back)
  @TransformJson(Back)
  @IsOptional()
  @ValidateNested()
  back?: Partial<Back>;

  @ApiProperty({ type: Requirements, required: false })
  @Type(() => Requirements)
  @TransformJson(Requirements)
  @IsOptional()
  @ValidateNested()
  requirements?: Partial<Requirements>;

  @ApiProperty({ type: Metadata, required: false })
  @Type(() => Metadata)
  @TransformJson(Metadata)
  @IsOptional()
  @ValidateNested()
  metadata?: Partial<Metadata>;
}
