import * as process from 'node:process';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth.service';
import { ConsultantService } from '../../consultant/consultant.service';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class ConsultantAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
    private readonly consultantService: ConsultantService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authorization = request?.headers['authorization'];
    
    if (!authorization) {
      throw new UnauthorizedException();
    }
    
    const token = authorization.replace('Bearer ', '');

    if (!token) {
      throw new UnauthorizedException();
    }

    const payload = await this.jwtService.verifyAsync<{ email: string }>(
      token,
      { secret: process.env.JWT_SECRET_KEY },
    );

    if (!payload) {
      throw new UnauthorizedException();
    }

    const user = await this.consultantService.getConsultantByEmail(
      payload.email,
    );

    if (!user) {
      throw new UnauthorizedException();
    }

    const valid = this.authService.compareToken(token, user.token);

    if (valid) {
      request.user = user;
    }

    return valid;
  }
}
