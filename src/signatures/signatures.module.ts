import { Module, forwardRef } from '@nestjs/common';
import { SignaturesService } from './signatures.service';
import { SignaturesController } from './signatures.controller';
import { Signature } from 'src/signatures/entities/signature.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpacesModule } from 'src/s3/s3.module';
import { TemplatesModule } from 'src/templates/templates.module';
import { ReduApiModule } from 'src/redu-api/redu-api.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Signature]),
    SpacesModule,
    forwardRef(() => TemplatesModule),
    ReduApiModule,
  ],
  controllers: [SignaturesController],
  providers: [SignaturesService],
  exports: [SignaturesService],
})
export class SignaturesModule {}
