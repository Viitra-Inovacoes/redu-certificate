import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  Scope,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Client } from 'src/client/entities/client.entity';
import { i18n } from 'src/i18n';
import { Repository } from 'typeorm';

type ClientName = 'development' | 'avaviitra' | 'avamec-homolog';
type ClientConfig = {
  name: ClientName;
  baseUrl: string;
  appKey: string;
};

@Injectable({ scope: Scope.REQUEST })
export class ClientService {
  private client: Client;
  private config: ClientConfig;
  private clients: Record<ClientName, ClientConfig> = {
    development: {
      name: 'development',
      baseUrl: 'http://localhost:3000/api',
      appKey: process.env.DEVELOPMENT_APP_KEY!,
    },
    avaviitra: {
      name: 'avaviitra',
      baseUrl: 'http://localhost:3000/api',
      appKey: process.env.DEVELOPMENT_APP_KEY!,
    },
    'avamec-homolog': {
      name: 'avamec-homolog',
      baseUrl: 'https://api-avamecinterativo.cin.ufpe.br/api',
      appKey: process.env.AVAMEC_HOMOLOG_APP_KEY!,
    },
  } as const;

  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
  ) {}

  get name(): ClientName {
    this.loadConfig();
    return this.config.name;
  }

  get baseUrl(): string {
    this.loadConfig();
    return this.config.baseUrl;
  }

  get appKey(): string {
    this.loadConfig();
    return this.config.appKey;
  }

  async getClient() {
    this.loadConfig();
    const client = await this.clientRepository.findOne({
      where: { name: this.config.name },
      relations: ['blueprint'],
    });

    this.client = client ?? (await this.create(this.config.name));
    return this.client;
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

  private loadConfig() {
    if (this.config) return;

    const name = this.request.headers['x-client-name'] as ClientName;
    if (!name)
      throw new BadRequestException(
        i18n.t('error.CLIENT_NAME_HEADER_REQUIRED'),
      );

    this.config = this.clients[name];
    if (!this.config)
      throw new BadRequestException(i18n.t('error.INVALID_CLIENT_NAME'));
  }

  private async create(name: ClientName) {
    const client = this.clientRepository.create({ name });
    return await this.clientRepository.save(client);
  }
}
