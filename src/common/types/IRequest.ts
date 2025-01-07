import { UserDocument } from '../../users/user.shema';
import { Request } from 'express';

export interface IRequest extends Request {
  user: UserDocument;
}
