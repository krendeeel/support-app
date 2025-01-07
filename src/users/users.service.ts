import { User } from './user.shema';
import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  public async getUserByEmail(email: string): Promise<User> {
    return this.usersRepository.findOne({ email });
  }

  public async getAllUser(): Promise<User[]> {
    return this.usersRepository.find({});
  }

  public async createUser(
    email: string,
    displayName: string,
    token: string,
  ): Promise<User> {
    return this.usersRepository.create({ email, displayName, token });
  }

  public async updateUser(
    email: string,
    updates: Partial<User>,
  ): Promise<User> {
    return this.usersRepository.findOneAndUpdate({ email }, updates);
  }
}
