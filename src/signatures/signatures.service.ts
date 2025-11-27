import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateSignatureDto } from './dto/create-signature.dto';
import { S3Service } from 'src/s3/s3.service';
import { v7 as uuidv7 } from 'uuid';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Signature } from 'src/signatures/entities/signature.entity';
import { i18n } from 'src/i18n';
import { Template } from 'src/templates/entities/template.entity';
import { SignatureResponseDto } from 'src/signatures/dto/signature-response.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class SignaturesService {
  constructor(
    @InjectRepository(Signature)
    private readonly signatureRepository: Repository<Signature>,
    private readonly s3: S3Service,
  ) {}

  async create(body: CreateSignatureDto, file: Express.Multer.File) {
    const signature = this.signatureRepository.create({
      id: uuidv7(),
      ...body,
    });

    try {
      await this.s3.uploadFile(file, signature.getSpacesKey());
      await this.checkCount(body.templateId);
      return await this.signatureRepository.save(signature);
    } catch (error) {
      await this.s3.deleteFile(signature.getSpacesKey());
      throw error;
    }
  }

  async copyToTemplate(signature: Signature, template: Template) {
    const newSignature = this.signatureRepository.create({
      id: uuidv7(),
      name: signature.name,
      role: signature.role,
      template,
    });

    await this.s3.copyFile(
      signature.getSpacesKey(),
      newSignature.getSpacesKey(),
    );
    return await this.signatureRepository.save(newSignature);
  }

  async serializeAllByTemplateId(templateId: string) {
    const signatures = await this.findByTemplateId(templateId);
    return Promise.all(signatures.map((s) => this.serialize(s)));
  }

  async serialize(signature: Signature) {
    const metadata = await this.s3.getMetadata(signature.getSpacesKey());
    const data = {
      ...signature,
      file: {
        ...metadata,
        url: await this.s3.getPresignedUrl(signature.getSpacesKey()),
      },
    };

    return plainToInstance(SignatureResponseDto, data, {
      excludeExtraneousValues: true,
      enableImplicitConversion: true,
    });
  }

  async findByTemplateId(templateId: string) {
    return await this.signatureRepository.find({ where: { templateId } });
  }

  async deleteByTemplateId(templateId: string) {
    await this.signatureRepository.delete({ templateId });
  }

  async remove(id: string) {
    return await this.signatureRepository.delete(id);
  }

  private async checkCount(templateId: string) {
    const count = await this.signatureRepository.count({
      where: { templateId },
    });
    if (count < 3) return;

    throw new BadRequestException(i18n.t('validation.MAX_SIGNATURES'));
  }
}
