import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientService } from 'src/client/client.service';
import { i18n } from 'src/i18n';
import { ReduApiService } from 'src/redu-api/redu-api.service';
import {
  Structure,
  StructureType,
} from 'src/structures/entities/structure.entity';
import {
  BackContentType,
  GradeType,
} from 'src/templates/entities/template.entity';
import { FindOneOptions, Repository } from 'typeorm';

export type Children = Exclude<BackContentType, BackContentType.CUSTOM>;

export type StructureData = {
  id: number;
  name: string;
  description: string;
  attendanceWorkload: number;
};
export type ChildrenData = {
  collection: StructureData[];
  pagination: {
    totalCount: number;
  };
};

export type CompletionData = {
  progress: number;
  presence: number;
  grade: number;
  enrolledAt: Date;
};

export type Paths = keyof typeof PATHS;

const PATHS = {
  environment: '/environments',
  course: '/courses',
  space: '/spaces',
  subject: '/subjects',
  lecture: '/lectures',
  completion: '/completion',
};

@Injectable()
export class StructuresService {
  constructor(
    @InjectRepository(Structure)
    private readonly structureRepository: Repository<Structure>,
    private readonly reduApi: ReduApiService,
    private readonly clientService: ClientService,
  ) {}

  async create(structureType: StructureType, structureId: number) {
    const client = await this.clientService.getClient();
    const reduStructure = await this.getReduStructure({
      structureType,
      structureId,
    });
    const structure = this.structureRepository.create({
      client,
      structureType,
      structureId,
      name: reduStructure.name,
    });
    return await this.structureRepository.save(structure);
  }

  async findOrCreate(structureType: StructureType, structureId: number) {
    try {
      return await this.findOneBy({
        where: { structureType, structureId },
      });
    } catch (error) {
      if (!(error instanceof NotFoundException)) throw error;
      return this.create(structureType, structureId);
    }
  }

  async findOneBy(options: FindOneOptions<Structure>) {
    const client = await this.clientService.getClient();
    const structure = await this.structureRepository.findOne({
      ...options,
      where: {
        ...options.where,
        client: { id: client.id },
      },
    });
    if (!structure)
      throw new NotFoundException(i18n.t('error.NOT_FOUND.STRUCTURE'));
    return structure;
  }

  async findOne(id: string) {
    return this.structureRepository.findOne({
      where: { id },
    });
  }

  async getReduStructure(structure: {
    structureType: StructureType;
    structureId: number;
  }) {
    const url = this.buildUrl({ structure });
    return await this.reduApi.get<StructureData>(url);
  }

  async getChildren(structure: Structure, children: Children) {
    const url = this.buildUrl({
      structure,
      resource: children,
    });
    return await this.reduApi.get<ChildrenData>(url);
  }

  async getCompletion(
    structure: Structure,
    gradeType?: GradeType,
    gradeId?: number,
  ) {
    const queryParams: Record<string, string> = {};
    if (gradeType) queryParams.grade_type = gradeType;
    if (gradeId) queryParams.grade_id = gradeId.toString();
    const url = this.buildUrl({
      structure,
      resource: 'completion',
      params: queryParams,
    });

    const completion = await this.reduApi.get<CompletionData>(url);
    return {
      progress: completion.progress,
      presence: completion.presence,
      grade: completion.grade,
      enrolledAt: new Date(completion.enrolledAt),
    };
  }

  private buildUrl({
    structure,
    resource,
    params,
  }: {
    structure: {
      structureType: StructureType;
      structureId: number;
    };
    resource?: Paths;
    params?: Record<string, string>;
  }) {
    const apiPrefix = '/v2/certificates';
    const structureSegment = `${PATHS[structure.structureType]}/${structure.structureId}`;
    const childSegment = resource ? PATHS[resource] : '';

    return this.reduApi.buildUrl(
      `${apiPrefix}${structureSegment}${childSegment}`,
      params,
    );
  }
}
