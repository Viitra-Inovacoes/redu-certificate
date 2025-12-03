import {
  Controller,
  Post,
  Patch,
  Param,
  Body,
  Delete,
  Get,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiResponse } from '@nestjs/swagger';
import { CreateTemplateDto } from 'src/templates/dto/create-template.dto';
import { templateSchema } from 'src/templates/dto/template-schema';
import { TemplatesService } from 'src/templates/templates.service';
import { PreviewService } from 'src/templates/preview.service';
import { StructureType } from 'src/structures/entities/structure.entity';
import { TemplateGuard } from 'src/templates/guards/template.guard';
import { Ability } from 'src/redu-api/authorization.service';
import { TemplateFilesInterceptor } from 'src/templates/decorators/template-files-interceptor.decorator';
import { TemplateFiles } from 'src/templates/decorators/template-files.decorators';
import { ApiAuth } from 'src/decorators/swagger/api-auth.decorator';
import { ApiStructureTypeIdParam } from 'src/decorators/swagger';
import { CloneTemplateDto } from 'src/templates/dto/clone-template.dto';
import { TemplateResponseDto } from 'src/templates/dto/template-response.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileValidationFactory } from 'src/validators/file-validation.factory';
import { SignatureSchema } from 'src/signatures/dto/signature-schema';
import { SignatureResponseDto } from 'src/signatures/dto/signature-response.dto';
import { CreateSignatureDto } from 'src/signatures/dto/create-signature.dto';
import { SignatureGuard } from 'src/signatures/guards/signature.guard';
import { SignaturesService } from 'src/signatures/signatures.service';
import { LogoSchema } from 'src/logos/dto/logo-schema';
import { LogosService } from 'src/logos/logos.service';
import { LogoResponseDto } from 'src/logos/dto/logo-response.dto';
import { LogoGuard } from 'src/logos/guards/logo.guard';
@Controller('templates')
@ApiAuth()
export class TemplatesController {
  constructor(
    private readonly templatesService: TemplatesService,
    private readonly previewService: PreviewService,
    private readonly signaturesService: SignaturesService,
    private readonly logosService: LogosService,
  ) {}

  @Post(':templateId/signatures')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: SignatureSchema })
  @UseInterceptors(FileInterceptor('file'))
  @ApiResponse({ type: SignatureResponseDto })
  @SignatureGuard(Ability.MANAGE)
  async createSignature(
    @Param('templateId') templateId: string,
    @Body() body: CreateSignatureDto,
    @UploadedFile(
      FileValidationFactory.createValidationPipe({
        fileIsRequired: true,
        maxSize: FileValidationFactory.toBytes(10, 'mb'),
        fileType: 'image/*',
      }),
    )
    file: Express.Multer.File,
  ) {
    const signature = await this.signaturesService.create(
      templateId,
      body,
      file,
    );
    return this.signaturesService.serialize(signature);
  }

  @Post(':templateId/logos')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: LogoSchema })
  @UseInterceptors(FileInterceptor('file'))
  @ApiResponse({ type: LogoResponseDto })
  @LogoGuard(Ability.MANAGE)
  async createLogo(
    @Param('templateId') templateId: string,
    @UploadedFile(
      FileValidationFactory.createValidationPipe({
        fileIsRequired: true,
        maxSize: FileValidationFactory.toBytes(10, 'mb'),
        fileType: 'image/*',
      }),
    )
    file: Express.Multer.File,
  ) {
    const logo = await this.logosService.create(templateId, file);
    return this.logosService.serialize(logo);
  }

  @Post(':structureType/:structureId/clone')
  @TemplateGuard(Ability.MANAGE)
  @ApiStructureTypeIdParam()
  @ApiBody({ type: CloneTemplateDto })
  async clone(
    @Param('structureType') structureType: StructureType,
    @Param('structureId') structureId: number,
    @Body() body: CloneTemplateDto,
  ) {
    return this.templatesService.clone(body, structureType, structureId);
  }

  @Post(':structureType/:structureId')
  @TemplateGuard(Ability.MANAGE)
  @ApiConsumes('multipart/form-data')
  @ApiStructureTypeIdParam()
  @ApiResponse({ type: TemplateResponseDto })
  async create(
    @Param('structureType') structureType: StructureType,
    @Param('structureId') structureId: number,
  ) {
    const template = await this.templatesService.create(
      structureType,
      structureId,
    );

    return this.templatesService.serialize(template);
  }

  @Get(':id/preview')
  @TemplateGuard(Ability.MANAGE)
  async preview(@Param('id') id: string) {
    return this.previewService.preview(id);
  }

  @Patch(':id/finish')
  @TemplateGuard(Ability.MANAGE)
  async finish(@Param('id') id: string) {
    return this.templatesService.finish(id);
  }

  @Patch(':id')
  @TemplateGuard(Ability.MANAGE)
  @TemplateFilesInterceptor()
  @ApiBody({ type: templateSchema })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ type: TemplateResponseDto })
  async update(
    @Param('id') id: string,
    @Body() body: CreateTemplateDto,
    @TemplateFiles() files: TemplateFiles,
  ) {
    const template = await this.templatesService.update(
      id,
      body,
      files.frontBackground,
      files.backBackground,
    );

    return this.templatesService.serialize(template);
  }

  @Patch(':id/generationEnabled')
  @TemplateGuard(Ability.MANAGE)
  @ApiBody({
    schema: {
      type: 'object',
      properties: { generationEnabled: { type: 'boolean' } },
    },
  })
  async updateGenerationEnabled(
    @Param('id') id: string,
    @Body() body: { generationEnabled: boolean },
  ) {
    return this.templatesService.updateGenerationEnabled(
      id,
      body.generationEnabled,
    );
  }

  @Delete(':id/certificates')
  @TemplateGuard(Ability.MANAGE)
  async invalidateAllCertificates(@Param('id') id: string) {
    return this.templatesService.invalidateAllCertificates(id);
  }

  @Delete(':id')
  @TemplateGuard(Ability.MANAGE)
  async delete(@Param('id') id: string) {
    return this.templatesService.delete(id);
  }

  @Get(':structureType/:structureId')
  @ApiStructureTypeIdParam()
  @TemplateGuard(Ability.READ)
  @ApiResponse({ type: TemplateResponseDto })
  async findOneByStructure(
    @Param('structureType') structureType: StructureType,
    @Param('structureId') structureId: number,
  ) {
    const template = await this.templatesService.findOneByStructure(
      structureType,
      structureId,
      { finished: true },
    );

    return this.templatesService.serialize(template);
  }
}
