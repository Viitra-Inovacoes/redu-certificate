import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  Body,
  UseInterceptors,
  UploadedFile,
  Request,
} from '@nestjs/common';
import { CertificatesService } from './certificates.service';
import { StructureType } from 'src/structures/entities/structure.entity';
import { CertificateGuard } from 'src/certificates/guards/certificate.guard';
import { Ability } from 'src/redu-api/authorization.service';
import { ApiSecurity, ApiStructureTypeIdParam } from 'src/decorators/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { MigrateCertificateDto } from 'src/certificates/dto/migrate-certificate.dto';

@Controller('certificates')
@ApiSecurity()
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Post('migrate')
  @UseInterceptors(FileInterceptor('pdf'))
  migrate(
    @Body() body: MigrateCertificateDto,
    @UploadedFile('file') pdf: Express.Multer.File,
  ) {
    return this.certificatesService.migrate(body, pdf);
  }

  @Get('')
  findAll() {
    return this.certificatesService.findAll();
  }

  @Post(':structureType/:structureId')
  @CertificateGuard(Ability.CREATE)
  @ApiStructureTypeIdParam()
  async create(
    @Param('structureType') structureType: StructureType,
    @Param('structureId') structureId: number,
  ) {
    return this.certificatesService.create(structureType, structureId);
  }

  @Get('validate/:validationCode')
  findOneByValidationCode(@Param('validationCode') validationCode: string) {
    return this.certificatesService.getValidationInfo(validationCode);
  }

  @Get(':structureType/:structureId')
  @CertificateGuard(Ability.MANAGE)
  @ApiStructureTypeIdParam()
  async findOneByStructure(
    @Param('structureType') structureType: StructureType,
    @Param('structureId') structureId: number,
  ) {
    return this.certificatesService.getCertificateInfo(
      structureType,
      structureId,
    );
  }

  @Delete(':id')
  @CertificateGuard(Ability.MANAGE)
  remove(@Param('id') id: string) {
    return this.certificatesService.remove(id);
  }
}
