import { Document, Schema as MongooseSchema } from 'mongoose';
import { QuestionDocument } from '../question/question.shema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ConsultantDocument } from '../consultant/consultant.shema';

@Schema()
export class Answer {
  @Prop({ required: true })
  text: string;
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Consultant',
    required: true,
  })
  author: MongooseSchema.Types.ObjectId | ConsultantDocument;
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Question' })
  question: MongooseSchema.Types.ObjectId | QuestionDocument;
  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

export const AnswerSchema = SchemaFactory.createForClass(Answer);

export type AnswerDocument = Answer & Document<MongooseSchema.Types.ObjectId>;
