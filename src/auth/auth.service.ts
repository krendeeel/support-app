import * as bcrypt from 'bcrypt';
import * as process from 'node:process';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/user.shema';
import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { Consultant } from '../consultant/consultant.shema';
import { ConsultantService } from '../consultant/consultant.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly consultantService: ConsultantService,
  ) {}

  public async validateGoogleUser(googleUser: {
    email: string;
    name: string;
  }): Promise<User> {
    const token = await this.jwtService.signAsync(googleUser, {
      secret: process.env.JWT_SECRET_KEY,
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    const tokenHash = await this.generateTokenHash(token);

    const user = await this.usersService.getUserByEmail(googleUser.email);

    if (user) {
      const updatedUser = await this.usersService.updateUser(user.email, {
        token: tokenHash,
      });

      return {
        ...updatedUser,
        token,
      };
    }

    const createdUser = await this.usersService.createUser(
      googleUser.email,
      googleUser.name,
      tokenHash,
    );

    return { ...createdUser, token };
  }

  public async validateYandexUser(yandexUser: {
    email: string;
    name: string;
  }): Promise<Consultant> {
    const token = await this.jwtService.signAsync(yandexUser, {
      secret: process.env.JWT_SECRET_KEY,
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    const tokenHash = await this.generateTokenHash(token);

    const user = await this.consultantService.getConsultantByEmail(
      yandexUser.email,
    );

    if (user) {
      const updatedUser = await this.consultantService.updateConsultant(
        user.email,
        { token: tokenHash },
      );

      return {
        ...updatedUser,
        token,
      };
    }

    const createdUser = await this.consultantService.createConsultant(
      yandexUser.email,
      yandexUser.name,
      tokenHash,
    );

    return { ...createdUser, token };
  }

  public async compareToken(
    token: string,
    tokenHash: string,
  ): Promise<boolean> {
    return await bcrypt.compare(token, tokenHash);
  }

  private async generateTokenHash(token: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(token, salt);
  }
}
