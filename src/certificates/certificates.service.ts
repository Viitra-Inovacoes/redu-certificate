import {
  Injectable,
  Inject,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { S3Service } from 'src/s3/s3.service';
import {
  Certificate,
  S3KeyFormat,
  S3KeyOptions,
} from './entities/certificate.entity';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindOneOptions, Repository } from 'typeorm';
import { v7 as uuidv7 } from 'uuid';
import {
  CertificateBuilderService,
  type Page,
} from 'src/certificates/certificate-builder.service';
import { S3KeyKind, Template } from 'src/templates/entities/template.entity';
import { RequirementsService } from 'src/certificates/requirements.service';
import { StructureType } from 'src/structures/entities/structure.entity';
import { TemplatesService } from 'src/templates/templates.service';
import { UsersService } from 'src/users/users.service';
import { i18n } from 'src/i18n';
import { Signature } from 'src/signatures/entities/signature.entity';
import { Logo } from 'src/logos/entities/logo.entity';

@Injectable()
export class CertificatesService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(Certificate)
    private readonly certificateRepository: Repository<Certificate>,
    private readonly s3: S3Service,
    private readonly usersService: UsersService,
    private readonly certificateBuilder: CertificateBuilderService,
    private readonly requirements: RequirementsService,
    @Inject(forwardRef(() => TemplatesService))
    private readonly templatesService: TemplatesService,
  ) {}

  async create(structureType: StructureType, structureId: number) {
    const template = await this.templatesService.findOneByStructure(
      structureType,
      structureId,
      {
        finished: true,
        generationEnabled: true,
        relations: {
          structure: true,
          logos: true,
          signatures: true,
          blueprint: true,
        },
      },
    );

    const certificate = await this.findOrInitializeCertificate(template);
    const files = await this.certificateBuilder.build(
      template,
      certificate.validationCode,
    );
    await this.uploadCertificate(certificate, files);
    await this.certificateRepository.save(certificate);
    return this.getUrls(certificate);
  }

  async findAll() {
    const { id: reduUserId } = await this.usersService.getReduUser();

    const certificates = await this.certificateRepository.find({
      where: { user: { reduUserId } },
      relations: { template: { structure: true } },
    });

    return Promise.all(
      certificates.map(async (certificate) => {
        return {
          canGenerate: await this.requirements.canGenerate(
            certificate.template,
          ),
          template: {
            title: certificate.template.front.title,
          },
          outdated: certificate.outdated,
          urls: await this.getUrls(certificate),
          createdAt: certificate.createdAt,
          structure: {
            type: certificate.template.structure.structureType,
            id: certificate.template.structure.structureId,
            name: certificate.template.structure.name,
          },
        };
      }),
    );
  }

  async findOne(id: string) {
    return this.findOneBy({ where: { id } });
  }

  async findOneBy(options: FindOneOptions<Certificate>) {
    const certificate = await this.certificateRepository.findOne(options);
    if (!certificate)
      throw new NotFoundException(i18n.t('error.NOT_FOUND.CERTIFICATE'));
    return certificate;
  }

  async getCertificateInfo(structureType: StructureType, structureId: number) {
    const { id: reduUserId } = await this.usersService.getReduUser();
    try {
      const certificate = await this.findOneBy({
        where: {
          user: { reduUserId },
          template: {
            structure: {
              structureType,
              structureId,
            },
          },
        },
        relations: { template: { structure: true } },
      });
      return {
        canGenerate: await this.requirements.canGenerate(certificate.template),
        outdated: certificate.outdated,
        requirements: certificate.template.requirements,
        urls: await this.getUrls(certificate),
      };
    } catch (error) {
      if (!(error instanceof NotFoundException)) throw error;
      return {
        canGenerate: false,
        outdated: false,
        requirements: null,
        urls: null,
      };
    }
  }

  async findOneByValidationCode(validationCode: string) {
    const certificate = await this.certificateRepository
      .createQueryBuilder('certificate')
      .leftJoinAndSelect('certificate.user', 'user')
      .leftJoinAndSelect('certificate.template', 'template')
      .leftJoinAndSelect('template.structure', 'structure')
      .leftJoin(
        (qb) =>
          qb
            .from(Signature, 'signature')
            .select('signature."templateId"', 'templateId')
            .addSelect('MAX(signature."updatedAt")', 'maxUpdatedAt')
            .groupBy('signature."templateId"'),
        'signatures',
        'signatures."templateId" = template.id',
      )
      .leftJoin(
        (qb) =>
          qb
            .from(Logo, 'logo')
            .select('logo."templateId"', 'templateId')
            .addSelect('MAX(logo."updatedAt")', 'maxUpdatedAt')
            .groupBy('logo."templateId"'),
        'logos',
        'logos."templateId" = template.id',
      )
      .where('certificate.validationCode = :validationCode', { validationCode })
      .andWhere('certificate.createdAt >= template.updatedAt')
      .andWhere(
        'certificate.createdAt >= COALESCE(signatures."maxUpdatedAt", certificate.createdAt)',
      )
      .andWhere(
        'certificate.createdAt >= COALESCE(logos."maxUpdatedAt", certificate.createdAt)',
      )
      .getOne();

    if (!certificate)
      throw new NotFoundException(i18n.t('error.NOT_FOUND.CERTIFICATE'));
    return certificate;
  }

  async getValidationInfo(validationCode: string) {
    const certificate = await this.findOneByValidationCode(validationCode);
    const url = await this.s3.getPresignedUrl(
      certificate.getS3Key({ kind: 'merged', format: 'pdf' }),
    );

    return {
      url,
      validationCode: certificate.validationCode,
      createdAt: certificate.createdAt,
      workload: certificate.template.front.workload,
      structure: {
        type: certificate.template.structure.structureType,
        id: certificate.template.structure.structureId,
        name: certificate.template.structure.name,
      },
      user: {
        name: certificate.user.name,
        email: certificate.user.email,
        description: certificate.user.description,
      },
    };
  }

  async remove(id: string) {
    const certificate = await this.findOne(id);
    return this.dataSource.transaction(async (entityManager) => {
      await entityManager.delete(Certificate, certificate.id);
      await this.s3.deleteFolder(certificate.folderKey);
    });
  }

  async invalidateByTemplateId(templateId: string) {
    const certificates = await this.certificateRepository.find({
      where: { templateId },
    });

    // caso isso gere problemas de performance, podemos criar uma coluna na tabela de certificados que indica que o certificado está invalidado.
    // outra alternativa seria tirar a constraint de NOT NULL na coluna validationCode e um certificado sem código de validação seria considerado inválido.
    await Promise.all(
      certificates.map((certificate) => this.remove(certificate.id)),
    );
  }

  private async findOrInitializeCertificate(template: Template) {
    const reduUser = await this.usersService.getReduUser();
    const user = await this.usersService.findOrCreate(reduUser);

    try {
      const certificate = await this.findOneBy({
        where: {
          template: {
            structure: {
              structureType: template.structure.structureType,
              structureId: template.structure.structureId,
            },
          },
          user: { reduUserId: reduUser.id },
        },
        relations: { template: { structure: true } },
      });
      return this.generateValidationCode(certificate);
    } catch (error) {
      if (!(error instanceof NotFoundException)) throw error;

      const certificate = this.certificateRepository.create({
        id: uuidv7(),
        template,
        user,
      });
      return this.generateValidationCode(certificate);
    }
  }

  private async generateValidationCode(certificate: Certificate) {
    certificate.generateValidationCode();
    while (
      await this.certificateRepository.findOne({
        where: { validationCode: certificate.validationCode },
      })
    ) {
      certificate.generateValidationCode();
    }
    return this.certificateRepository.save(certificate);
  }

  private async uploadCertificate(
    certificate: Certificate,
    files: {
      front: Page;
      back: Page | undefined;
      merged: Express.Multer.File;
    },
  ) {
    await Promise.all([
      this.uploadPage(certificate, 'front', files.front),
      this.uploadPage(certificate, 'back', files.back),
      this.s3.uploadFile(
        files.merged,
        certificate.getS3Key({ kind: 'merged', format: 'pdf' }),
      ),
    ]);
  }

  private async uploadPage(
    certificate: Certificate,
    kind: 'front' | 'back',
    page?: Page,
  ) {
    if (!page) return;

    const key = (format: S3KeyFormat) => certificate.getS3Key({ kind, format });
    await Promise.all([
      this.s3.uploadFile(page.pdf, key('pdf')),
      this.s3.uploadFile(page.png, key('png')),
      this.s3.uploadString(page.html, key('html'), 'text/html'),
    ]);
  }

  private async getUrls(certificate: Certificate) {
    const [frontHtml, frontPdf, frontPng, mergedPdf] = await Promise.all(
      [
        { kind: 'front', format: 'html' },
        { kind: 'front', format: 'pdf' },
        { kind: 'front', format: 'png' },
        { kind: 'merged', format: 'pdf' },
      ].map((options: S3KeyOptions) => {
        const key = certificate.getS3Key(options);
        return this.s3.getPresignedUrl(key);
      }),
    );

    const urls = {
      front: { html: frontHtml, pdf: frontPdf, png: frontPng },
      back: { html: null, pdf: null, png: null },
      merged: { pdf: mergedPdf },
    } as Record<S3KeyKind, Record<S3KeyFormat, string | null>>;

    if (certificate.template.metadata.hasBackPage) {
      const [backHtml, backPdf, backPng] = await Promise.all(
        [
          { kind: 'back', format: 'html' },
          { kind: 'back', format: 'pdf' },
          { kind: 'back', format: 'png' },
        ].map((options: S3KeyOptions) => {
          const key = certificate.getS3Key(options);
          return this.s3.getPresignedUrl(key);
        }),
      );
      urls.back = { html: backHtml, pdf: backPdf, png: backPng };
    }

    return urls;
  }
}
