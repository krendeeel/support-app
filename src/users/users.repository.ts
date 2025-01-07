import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './user.shema';
import { FilterQuery, Model } from 'mongoose';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  public async findOne(query: FilterQuery<User>): Promise<User> {
    return this.userModel.findOne(query);
  }

  public async find(query: FilterQuery<User>): Promise<User[]> {
    return this.userModel.find(query);
  }

  public async create(user: {
    email: string;
    displayName: string;
    token: string;
  }): Promise<User> {
    const newUser = new this.userModel(user);
    return newUser.save();
  }
  public async findOneAndUpdate(
    query: FilterQuery<User>,
    user: Partial<User>,
  ): Promise<User> {
    return this.userModel.findOneAndUpdate(query, user);
  }
}
