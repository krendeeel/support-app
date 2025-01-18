import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Question, QuestionDocument } from './question.shema';
import { FilterQuery, Model, Schema as MongooseSchema } from 'mongoose';

@Injectable()
export class QuestionRepository {
  constructor(
    @InjectModel(Question.name)
    private questionModel: Model<QuestionDocument>,
  ) {}

  public async find(
    query: FilterQuery<Question>,
    page: number = 10,
    limit: number = 10,
  ): Promise<Question[]> {
    const skip = (page - 1) * limit;
    return this.questionModel
      .find(query)
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .populate('author')
      .populate({
        path: 'answer',
        populate: {
          path: 'author',
          model: 'Consultant',
        },
      })
      .exec();
  }

  public async findOne(query: FilterQuery<Question>): Promise<Question> {
    return this.questionModel.findOne(query);
  }

  public async create({
    text,
    authorId,
  }: {
    text: string;
    authorId: MongooseSchema.Types.ObjectId;
  }): Promise<Question> {
    const question = new this.questionModel({
      text,
      author: authorId,
    });

    return question.save();
  }

  public async findOneAndUpdate(
    query: FilterQuery<QuestionDocument>,
    question: Partial<QuestionDocument>,
  ): Promise<QuestionDocument> {
    return this.questionModel.findOneAndUpdate(query, question);
  }

  public async deleteOne(query: FilterQuery<Question>) {
    return this.questionModel.deleteOne(query);
  }
}
