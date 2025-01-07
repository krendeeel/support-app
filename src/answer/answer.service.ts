import { Answer } from './answer.shema';
import { Injectable } from '@nestjs/common';
import { Schema as MongooseSchema } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AnswerRepository } from './answer.repository';
import { QuestionRepository } from '../question/question.repository';

@Injectable()
export class AnswerService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly answerRepository: AnswerRepository,
    private readonly questionRepository: QuestionRepository,
  ) {}

  public async getAnswerById(id: string): Promise<Answer> {
    return this.answerRepository.findOne({ _id: id });
  }

  public async getAnswersByAuthorId({
    authorId,
    limit,
    page,
  }: {
    authorId: MongooseSchema.Types.ObjectId;
    page?: number;
    limit?: number;
  }): Promise<Answer[]> {
    return this.answerRepository.find({ author: authorId }, page, limit);
  }

  public async createAnswer({
    text,
    authorId,
    questionId,
  }: {
    text: string;
    authorId: MongooseSchema.Types.ObjectId;
    questionId: MongooseSchema.Types.ObjectId;
  }): Promise<Answer> {
    const answer = await this.answerRepository.create({
      text,
      authorId,
      questionId,
    });

    const question = await this.questionRepository.findOneAndUpdate(
      { _id: questionId },
      { answer: answer._id },
    );

    this.eventEmitter.emit('new.answer', question.author.toString(), {
      id: questionId,
    });

    return answer;
  }

  public async updateAnswer(
    _id: string,
    updates: Partial<Answer>,
  ): Promise<Answer> {
    return this.answerRepository.findOneAndUpdate({ _id }, updates);
  }

  public async deleteAnswerById(_id: string) {
    return this.answerRepository.deleteOne({ _id });
  }
}
