import { UserDocument } from '../users/user.shema';
import { AnswerDocument } from '../answer/answer.shema';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Question {
  @Prop({ required: true })
  text: string;
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  author: MongooseSchema.Types.ObjectId | UserDocument;
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Answer' })
  answer: MongooseSchema.Types.ObjectId | AnswerDocument;
  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);

export type QuestionDocument = Question & Document;
