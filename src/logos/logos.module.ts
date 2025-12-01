import { Module, forwardRef } from '@nestjs/common';
import { LogosService } from './logos.service';
import { LogosController } from './logos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Logo } from 'src/logos/entities/logo.entity';
import { SpacesModule } from 'src/s3/s3.module';
import { TemplatesModule } from 'src/templates/templates.module';
import { ReduApiModule } from 'src/redu-api/redu-api.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Logo]),
    SpacesModule,
    forwardRef(() => TemplatesModule),
    ReduApiModule,
  ],
  controllers: [LogosController],
  providers: [LogosService],
  exports: [LogosService],
})
export class LogosModule {}
