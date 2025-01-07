import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema()
export class Consultant {
  @Prop({ required: true, unique: true })
  email: string;
  @Prop({ required: true })
  displayName: string;
  @Prop({ required: true })
  token: string;
}

export const ConsultantSchema = SchemaFactory.createForClass(Consultant);

export type ConsultantDocument = Consultant &
  Document<MongooseSchema.Types.ObjectId>;
