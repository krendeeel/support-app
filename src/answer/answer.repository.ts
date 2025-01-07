import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Answer, AnswerDocument } from './answer.shema';
import { FilterQuery, Model, Schema as MongooseSchema } from 'mongoose';

@Injectable()
export class AnswerRepository {
  constructor(
    @InjectModel(Answer.name)
    private answerModel: Model<AnswerDocument>,
  ) {}

  public async find(
    query: FilterQuery<Answer>,
    page: number = 10,
    limit: number = 10,
  ): Promise<Answer[]> {
    const skip = (page - 1) * limit;
    return this.answerModel
      .find(query)
      .skip(skip)
      .limit(limit)
      .populate('author')
      .exec();
  }

  public async findOne(query: FilterQuery<Answer>): Promise<Answer> {
    return this.answerModel.findOne(query);
  }

  public async create({
    text,
    authorId,
    questionId,
  }: {
    text: string;
    authorId: MongooseSchema.Types.ObjectId;
    questionId: MongooseSchema.Types.ObjectId;
  }): Promise<AnswerDocument> {
    const answer = new this.answerModel({
      text,
      author: authorId,
      question: questionId,
    });
    return answer.save();
  }

  public async findOneAndUpdate(
    query: FilterQuery<Answer>,
    question: Partial<Answer>,
  ): Promise<Answer> {
    return this.answerModel
      .findOneAndUpdate(query, question)
      .populate('author')
      .exec();
  }

  public async deleteOne(query: FilterQuery<Answer>) {
    return this.answerModel.deleteOne(query).populate('author').exec();
  }
}
