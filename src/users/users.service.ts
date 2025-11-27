import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientService } from 'src/client/client.service';
import { i18n } from 'src/i18n';
import { ReduApiService } from 'src/redu-api/redu-api.service';
import { User } from 'src/users/entities/user.entity';
import { FindOneOptions, Repository } from 'typeorm';
import { v7 as uuidv7 } from 'uuid';

export type ReduUser = {
  id: number;
  name: string;
  cpf: string;
  email: string;
  description: string;
  avatar: string;
};

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly reduApi: ReduApiService,
    private readonly clientService: ClientService,
  ) {}

  async create(reduUser?: ReduUser) {
    reduUser = reduUser ?? (await this.getReduUser());
    const client = await this.clientService.getClient();
    const user = this.userRepository.create({
      ...reduUser,
      id: uuidv7(),
      reduUserId: reduUser.id,
      client,
    });
    return await this.userRepository.save(user);
  }

  async findOneBy(options: FindOneOptions<User>) {
    const user = await this.userRepository.findOne(options);
    if (!user) throw new NotFoundException(i18n.t('error.NOT_FOUND.USER'));
    return user;
  }

  async findOrCreate(reduUser: ReduUser) {
    try {
      await this.userRepository.update(
        { reduUserId: reduUser.id },
        {
          name: reduUser.name,
          email: reduUser.email,
          description: reduUser.description,
          avatar: reduUser.avatar,
        },
      );
      return await this.findOneBy({ where: { reduUserId: reduUser.id } });
    } catch (error) {
      if (!(error instanceof NotFoundException)) throw error;
      return this.create(reduUser);
    }
  }

  async getReduUser() {
    const url = this.reduApi.buildUrl('/v2/certificates/me');
    return this.reduApi.get<ReduUser>(url);
  }
}
