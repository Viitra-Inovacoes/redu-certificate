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
import { Client } from 'src/client/entities/client.entity';
import { Logo } from 'src/logos/entities/logo.entity';
import { Signature } from 'src/signatures/entities/signature.entity';

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

  async getInfo(structureType: StructureType, structureId: number) {
    const template = await this.findOneByStructure(structureType, structureId);
    const [logos, signatures] = await Promise.all([
      this.logosService.getInfo(template.id),
      this.signaturesService.getInfo(template.id),
    ]);

    return {
      template,
      logos,
      signatures,
    };
  }

  async clone(
    body: CloneTemplateDto,
    OriginalStructureType: StructureType,
    OriginalStructureId: number,
  ) {
    const { structures } = body;
    const client = await this.clientService.getClient();
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
        this.cloneOne(client, originalTemplate, structure, logos, signatures),
      ),
    );
  }

  async cloneOne(
    client: Client,
    original: Template,
    structure: Structure,
    logos: Logo[],
    signatures: Signature[],
  ) {
    let template = await this.findOrInitialize(
      structure.structureType,
      structure.structureId,
    );
    let structure_founded = await this.structureService.findOrCreate(
      structure.structureType,
      structure.structureId,
    );

    template = {
      ...original,
      id: template.id,
      structure: structure_founded
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
      ]);
      
    } catch (error) {
      // await this.s3.deleteFolder(template.folderKey);
      throw error;
    }
  }

  async create(structureType: StructureType, structureId: number) {
    const template = await this.findOrInitialize(structureType, structureId);
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
          hasBackPage:
            body.metadata?.hasBackPage ?? template.metadata.hasBackPage,
          customBackground: {
            front:
              Boolean(frontBackground) ||
              body.metadata?.customBackground?.front,
            back:
              Boolean(backBackground) || body.metadata?.customBackground?.back,
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
    const template = await this.findOne(id);

    return this.dataSource.transaction(async (entityManager) => {
      await entityManager.delete(Template, template.id);
      await this.s3.deleteFolder(template.folderKey);
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
    template = {
      ...template,
      front: undefined,
      back: undefined,
      requirements: undefined,
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
}
