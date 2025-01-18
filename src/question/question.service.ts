import { Question } from './question.shema';
import { Injectable } from '@nestjs/common';
import { FilterQuery, Schema as MongooseSchema } from 'mongoose';
import { QuestionRepository } from './question.repository';

@Injectable()
export class QuestionService {
  constructor(private readonly questionRepository: QuestionRepository) {}

  public async getQuestionById(id: string): Promise<Question> {
    return this.questionRepository.findOne({ _id: id });
  }

  public async getAllQuestions({
    limit,
    page,
    query,
    authorId,
    byAnswer,
  }: {
    page?: number;
    limit?: number;
    query?: string;
    byAnswer?: '0' | '1';
    authorId?: MongooseSchema.Types.ObjectId;
  }): Promise<Question[]> {
    const find: FilterQuery<Question> = {};

    if (authorId) {
      find.author = authorId;
    }

    if (query) {
      find.text = { $regex: query, $options: 'i' };
    }

    if (byAnswer === '1') {
      find.answer = { $exists: true, $ne: null };
    }

    if (byAnswer === '0') {
      find.answer = { $exists: false };
    }

    return this.questionRepository.find(find, page, limit);
  }

  public async getQuestionsByAuthorId({
    authorId,
    limit,
    page,
  }: {
    authorId: MongooseSchema.Types.ObjectId;
    page?: number;
    limit?: number;
  }): Promise<Question[]> {
    return this.questionRepository.find({ author: authorId }, page, limit);
  }

  public async createQuestion({
    text,
    authorId,
  }: {
    text: string;
    authorId: MongooseSchema.Types.ObjectId;
  }): Promise<Question> {
    return this.questionRepository.create({ text, authorId });
  }

  public async updateQuestion(
    id: string,
    updates: Partial<Question>,
  ): Promise<Question> {
    return this.questionRepository.findOneAndUpdate({ _id: id }, updates);
  }

  public async deleteQuestionById(id: string) {
    return this.questionRepository.deleteOne({ _id: id });
  }
}
