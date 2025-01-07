import { Module } from '@nestjs/common';
import { AnswerService } from './answer.service';
import { AuthModule } from '../auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Answer, AnswerSchema } from './answer.shema';
import { AnswerController } from './answer.controller';
import { AnswerRepository } from './answer.repository';
import { QuestionModule } from '../question/question.module';
import { ConsultantModule } from '../consultant/consultant.module';

@Module({
  exports: [AnswerService],
  controllers: [AnswerController],
  providers: [AnswerService, AnswerRepository],
  imports: [
    AuthModule,
    QuestionModule,
    ConsultantModule,
    MongooseModule.forFeature([{ name: Answer.name, schema: AnswerSchema }]),
  ],
})
export class AnswerModule {}
