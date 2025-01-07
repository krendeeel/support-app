import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  email: string;
  @Prop({ required: true })
  displayName: string;
  @Prop({ required: true })
  token: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

export type UserDocument = User & Document<MongooseSchema.Types.ObjectId>;
