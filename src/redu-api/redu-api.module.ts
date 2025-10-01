import { Module } from '@nestjs/common';
import { ReduAuthorizationService } from 'src/redu-api/authorization.service';
import { ReduApiService } from 'src/redu-api/redu-api.service';
import { ClientModule } from 'src/client/client.module';

@Module({
  imports: [ClientModule],
  providers: [ReduAuthorizationService, ReduApiService],
  exports: [ReduAuthorizationService, ReduApiService],
})
export class ReduApiModule {}
