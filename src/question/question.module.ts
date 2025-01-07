import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '../users/user.module';
import { QuestionService } from './question.service';
import { QuestionController } from './question.controller';
import { QuestionRepository } from './question.repository';
import { Question, QuestionSchema } from './question.shema';
import { ConsultantModule } from '../consultant/consultant.module';

@Module({
  controllers: [QuestionController],
  exports: [QuestionService, QuestionRepository],
  providers: [QuestionService, QuestionRepository],
  imports: [
    UsersModule,
    AuthModule,
    ConsultantModule,
    MongooseModule.forFeature([
      { name: Question.name, schema: QuestionSchema },
    ]),
  ],
})
export class QuestionModule {}
