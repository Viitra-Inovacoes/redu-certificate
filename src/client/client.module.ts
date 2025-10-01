import { Module } from '@nestjs/common';
import { ClientService } from './client.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from './entities/client.entity';
import { Blueprint } from 'src/blueprints/entities/blueprint.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Client, Blueprint])],
  providers: [ClientService],
  exports: [ClientService],
})
export class ClientModule {}
