import { Module } from '@nestjs/common';
import { ClientModule } from 'src/client/client.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReduApiModule } from 'src/redu-api/redu-api.module';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

@Module({
  imports: [ReduApiModule, ClientModule, TypeOrmModule.forFeature([User])],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
