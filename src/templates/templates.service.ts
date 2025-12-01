import {
  BadRequestException,
  Injectable,
  Inject,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { ClientService } from 'src/client/client.service';
import { S3Service } from 'src/s3/s3.service';
import {
  Structure,
  StructureType,
} from 'src/structures/entities/structure.entity';
import { StructuresService } from 'src/structures/structures.service';
import { CreateTemplateDto } from 'src/templates/dto/create-template.dto';
import { Template } from 'src/templates/entities/template.entity';
import {
  DataSource,
  FindOneOptions,
  FindOptionsRelations,
  Repository,
} from 'typeorm';
import { v7 as uuidv7 } from 'uuid';
import { i18n } from 'src/i18n';
import { LogosService } from 'src/logos/logos.service';
import { SignaturesService } from 'src/signatures/signatures.service';
import { CertificatesService } from 'src/certificates/certificates.service';
import { CloneTemplateDto } from 'src/templates/dto/clone-template.dto';
import { Logo } from 'src/logos/entities/logo.entity';
import { Signature } from 'src/signatures/entities/signature.entity';
import { plainToInstance } from 'class-transformer';
import { TemplateResponseDto } from 'src/templates/dto/template-response.dto';

@Injectable()
export class TemplatesService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(Template)
    private readonly templateRepository: Repository<Template>,
    private readonly clientService: ClientService,
    private readonly structureService: StructuresService,
    private readonly s3: S3Service,
    private readonly logosService: LogosService,
    private readonly signaturesService: SignaturesService,
    @Inject(forwardRef(() => CertificatesService))
    private readonly certificatesService: CertificatesService,
  ) {}

  async finish(id: string) {
    const template = await this.findOne(id, { logos: true, signatures: true });
    if (template.finished) return;

    if (template.logos.length > 3)
      throw new BadRequestException(i18n.t('validation.MAX_LOGOS'));
    if (template.signatures.length < 1 || template.signatures.length > 3)
      throw new BadRequestException(i18n.t('validation.MAX_SIGNATURES'));

    await this.templateRepository.update(id, {
      finished: true,
    });
  }

  async serialize(template: Template) {
    const [frontBackground, backBackground, logos, signatures] =
      await Promise.all([
        this.getBackgroundInfo(template, 'front'),
        this.getBackgroundInfo(template, 'back'),
        this.logosService.serializeAllByTemplateId(template.id),
        this.signaturesService.serializeAllByTemplateId(template.id),
      ]);

    const data = {
      ...template,
      frontBackground,
      backBackground,
      logos,
      signatures,
    };

    return plainToInstance(TemplateResponseDto, data, {
      excludeExtraneousValues: true,
      enableImplicitConversion: true,
    });
  }

  async clone(
    body: CloneTemplateDto,
    OriginalStructureType: StructureType,
    OriginalStructureId: number,
  ) {
    const { structures } = body;
    const originalTemplate = await this.findOneBy({
      where: {
        structure: {
          structureType: OriginalStructureType,
          structureId: OriginalStructureId,
        },
      },
    });

    const [logos, signatures] = await Promise.all([
      this.logosService.findByTemplateId(originalTemplate.id),
      this.signaturesService.findByTemplateId(originalTemplate.id),
    ]);

    await Promise.all(
      structures.map((structure: Structure) =>
        this.cloneOne(originalTemplate, structure, logos, signatures),
      ),
    );
  }

  async cloneOne(
    original: Template,
    structure: Structure,
    logos: Logo[],
    signatures: Signature[],
  ) {
    let template = await this.findOrInitialize(
      structure.structureType,
      structure.structureId,
    );

    template = {
      ...original,
      id: template.id,
      structure: template.structure,
    } as Template;

    try {
      await this.templateRepository.save(template);
      await Promise.all([
        ...logos.map((logo) =>
          this.logosService.copyToTemplate(logo, template),
        ),
        ...signatures.map((signature) =>
          this.signaturesService.copyToTemplate(signature, template),
        ),
        this.copyBackground(original, template),
      ]);
    } catch (error) {
      await this.s3.deleteFolder(template.folderKey);
      throw error;
    }
  }

  async create(structureType: StructureType, structureId: number) {
    const template = await this.findOrInitialize(structureType, structureId);
    console.log('template', template);
    return this.templateRepository.save(template);
  }

  async update(
    id: string,
    body: CreateTemplateDto,
    frontBackground?: Express.Multer.File,
    backBackground?: Express.Multer.File,
  ) {
    const template = await this.findOne(id);
    await this.dataSource.transaction(async (entityManager) => {
      await entityManager.update(Template, template.id, {
        ...(body as Template),
        metadata: {
          hasBackPage: body.metadata?.hasBackPage,
          customBackground: {
            front:
              body.metadata?.customBackground?.front ||
              Boolean(frontBackground),
            back:
              body.metadata?.customBackground?.back || Boolean(backBackground),
          },
        },
      });
      if (frontBackground)
        await this.uploadBackground(template, 'front', frontBackground);
      if (backBackground)
        await this.uploadBackground(template, 'back', backBackground);
    });

    return this.findOne(id);
  }

  async delete(id: string) {
    await this.templateRepository.update(id, {
      generationEnabled: false,
      finished: false,
    });
  }

  async updateGenerationEnabled(id: string, generationEnabled: boolean) {
    const tableName = this.templateRepository.metadata.tableName;
    await this.dataSource.query(
      `UPDATE "${tableName}" SET "generationEnabled" = $1 WHERE id = $2`,
      [generationEnabled, id],
    );
  }

  async invalidateAllCertificates(id: string) {
    return this.certificatesService.invalidateByTemplateId(id);
  }

  async resetTemplate(template: Template) {
    const blueprint = await this.clientService.getDefaultBlueprint();

    template = {
      ...template,
      blueprint,
      front: null,
      back: null,
      requirements: null,
      metadata: {
        hasBackPage: false,
        customBackground: {
          front: false,
          back: false,
        },
      },
    } as unknown as Template;

    await Promise.all([
      this.logosService.deleteByTemplateId(template.id),
      this.signaturesService.deleteByTemplateId(template.id),
    ]);

    return template;
  }

  async findOrInitialize(structureType: StructureType, structureId: number) {
    try {
      const template = await this.findOneByStructure(
        structureType,
        structureId,
        {
          finished: false,
          relations: {
            structure: true,
            blueprint: true,
          },
        },
      );
      return this.resetTemplate(template);
    } catch (error) {
      if (!(error instanceof NotFoundException)) throw error;

      const blueprint = await this.clientService.getDefaultBlueprint();
      const structure = await this.structureService.findOrCreate(
        structureType,
        structureId,
      );
      return this.templateRepository.create({
        id: uuidv7(),
        blueprint,
        structure,
        metadata: {
          hasBackPage: false,
          customBackground: {
            front: false,
            back: false,
          },
        },
      });
    }
  }

  async findOne(id: string, relations?: FindOptionsRelations<Template>) {
    return this.findOneBy({ where: { id }, relations });
  }

  async findOneBy(options: FindOneOptions<Template>) {
    const template = await this.templateRepository.findOne(options);
    if (!template)
      throw new NotFoundException(i18n.t('error.NOT_FOUND.TEMPLATE'));
    return template;
  }

  async findOneByStructure(
    structureType: StructureType,
    structureId: number,
    options?: {
      finished?: boolean;
      generationEnabled?: boolean;
      relations?: FindOptionsRelations<Template>;
    },
  ) {
    return this.findOneBy({
      where: {
        structure: {
          structureType,
          structureId,
        },
        finished: options?.finished,
      },
      relations: options?.relations,
    });
  }

  private async uploadBackground(
    template: Template,
    kind: 'front' | 'back',
    file?: Express.Multer.File,
  ) {
    if (!file) return;
    const key = template.getS3Key({ kind: `${kind}Background` });
    return this.s3.uploadFile(file, key);
  }

  private async getBackgroundInfo(template: Template, kind: 'front' | 'back') {
    if (!template.metadata.customBackground[kind]) return;

    const key = template.getS3Key({ kind: `${kind}Background` });
    const metadata = await this.s3.getMetadata(key);

    return {
      name: metadata.name,
      size: metadata.size,
      contentType: metadata.contentType,
      url: await this.s3.getPresignedUrl(key),
    };
  }

  private async copyBackground(source: Template, destination: Template) {
    if (source.metadata.customBackground.front) {
      await this.s3.copyFile(
        source.getS3Key({ kind: 'frontBackground' }),
        destination.getS3Key({ kind: 'frontBackground' }),
      );
    }

    if (source.metadata.customBackground.back) {
      await this.s3.copyFile(
        source.getS3Key({ kind: 'backBackground' }),
        destination.getS3Key({ kind: 'backBackground' }),
      );
    }
  }
}
