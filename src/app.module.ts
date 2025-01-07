import * as process from 'node:process';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/user.module';
import { AnswerModule } from './answer/answer.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { QuestionModule } from './question/question.module';
import { ConsultantModule } from './consultant/consultant.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    AnswerModule,
    QuestionModule,
    ConsultantModule,
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot({ global: true }),
    MongooseModule.forRoot(process.env.DATABASE_URL),
  ],
  controllers: [AppController],
})
export class AppModule {}
