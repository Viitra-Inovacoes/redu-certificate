import { Module } from '@nestjs/common';
import { StructuresService } from 'src/structures/structures.service';
import { ClientModule } from 'src/client/client.module';
import { Structure } from 'src/structures/entities/structure.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReduApiModule } from 'src/redu-api/redu-api.module';

@Module({
  imports: [ReduApiModule, ClientModule, TypeOrmModule.forFeature([Structure])],
  providers: [StructuresService],
  exports: [StructuresService],
})
export class StructuresModule {}
