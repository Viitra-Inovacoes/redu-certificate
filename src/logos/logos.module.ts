import { Module } from '@nestjs/common';
import { LogosService } from './logos.service';
import { LogosController } from './logos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Logo } from 'src/logos/entities/logo.entity';
import { SpacesModule } from 'src/s3/s3.module';

@Module({
  imports: [TypeOrmModule.forFeature([Logo]), SpacesModule],
  controllers: [LogosController],
  providers: [LogosService],
  exports: [LogosService],
})
export class LogosModule {}
