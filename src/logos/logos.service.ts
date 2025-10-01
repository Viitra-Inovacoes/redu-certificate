import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateLogoDto } from './dto/create-logo.dto';
import { S3Service } from 'src/s3/s3.service';
import { v7 as uuidv7 } from 'uuid';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logo } from 'src/logos/entities/logo.entity';
import { i18n } from 'src/i18n';
import { Template } from 'src/templates/entities/template.entity';

@Injectable()
export class LogosService {
  constructor(
    @InjectRepository(Logo)
    private readonly logoRepository: Repository<Logo>,
    private readonly s3: S3Service,
  ) {}

  async create(body: CreateLogoDto, file: Express.Multer.File) {
    const logo = this.logoRepository.create({
      id: uuidv7(),
      ...body,
    });

    try {
      await this.s3.uploadFile(file, logo.getSpacesKey());
      await this.checkCount(body.templateId);
      return await this.logoRepository.save(logo);
    } catch (error) {
      await this.s3.deleteFile(logo.getSpacesKey());
      throw error;
    }
  }

  async copyToTemplate(logo: Logo, template: Template) {
    const newLogo = this.logoRepository.create({
      id: uuidv7(),
      template,
    });

    await this.s3.copyFile(logo.getSpacesKey(), newLogo.getSpacesKey());
    return await this.logoRepository.save(newLogo);
  }

  async getInfo(templateId: string) {
    const logos = await this.findByTemplateId(templateId);
    const files = await Promise.all(
      logos.map((logo) => this.s3.getFile(logo.getSpacesKey())),
    );

    return Promise.all(
      logos.map(async (logo, index) => ({
        id: logo.id,
        url: await this.s3.getPresignedUrl(logo.getSpacesKey()),
        fileName: files[index].Metadata?.originalName,
      })),
    );
  }

  async findByTemplateId(templateId: string) {
    return await this.logoRepository.find({ where: { templateId } });
  }

  async deleteByTemplateId(templateId: string) {
    await this.logoRepository.delete({ templateId });
  }

  async remove(id: string) {
    return await this.logoRepository.delete(id);
  }

  private async checkCount(templateId: string) {
    const count = await this.logoRepository.count({ where: { templateId } });
    if (count < 3) return;

    throw new BadRequestException(i18n.t('validation.MAX_LOGOS'));
  }
}
