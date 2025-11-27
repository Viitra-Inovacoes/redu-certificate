import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  Scope,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientKey, configs } from 'src/client/configs';
import { Client } from 'src/client/entities/client.entity';
import { i18n } from 'src/i18n';
import { Repository } from 'typeorm';

@Injectable({ scope: Scope.REQUEST })
export class ClientService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
  ) {}

  get baseUrl(): string {
    return this.config.baseUrl;
  }

  get appKey(): string {
    return this.config.appKey;
  }

  async getClient() {
    const client = await this.clientRepository.findOne({
      where: { name: this.clientName },
      relations: ['blueprint'],
    });

    return client ?? (await this.create(this.clientName));
  }

  async setDefaultBlueprint(blueprintId: string) {
    const client = await this.getClient();
    await this.clientRepository.update(client.id, {
      blueprint: {
        id: blueprintId,
      },
    });
  }

  async getDefaultBlueprint() {
    const client = await this.getClient();
    const blueprint = client.blueprint;
    if (!blueprint)
      throw new NotFoundException(i18n.t('error.NOT_FOUND.BLUEPRINT'));
    return blueprint;
  }

  get config() {
    const config = configs[this.clientName];
    if (!config)
      throw new BadRequestException(i18n.t('error.INVALID_CLIENT_NAME'));

    return config;
  }

  get clientName(): ClientKey {
    const name = this.request.headers['x-client-name'] as ClientKey;
    if (!name)
      throw new BadRequestException(
        i18n.t('error.CLIENT_NAME_HEADER_REQUIRED'),
      );

    return name;
  }

  private async create(name: ClientKey) {
    const client = this.clientRepository.create({ name });
    return await this.clientRepository.save(client);
  }
}
