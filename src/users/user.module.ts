import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { User, UserSchema } from './user.shema';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersRepository } from './users.repository';

@Module({
  exports: [UsersService],
  providers: [UsersService, UsersRepository],
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
})
export class UsersModule {}
