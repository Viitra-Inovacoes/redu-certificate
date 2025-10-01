import { Module } from '@nestjs/common';
import { BlueprintsService } from './blueprints.service';
import { BlueprintsController } from './blueprints.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Blueprint } from './entities/blueprint.entity';
import { SpacesModule } from 'src/s3/s3.module';
import { ReduApiModule } from 'src/redu-api/redu-api.module';
import { ClientModule } from 'src/client/client.module';

@Module({
  imports: [
    ClientModule,
    ReduApiModule,
    SpacesModule,
    TypeOrmModule.forFeature([Blueprint]),
  ],
  controllers: [BlueprintsController],
  providers: [BlueprintsService],
  exports: [BlueprintsService],
})
export class BlueprintsModule {}
