import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/user.module';
import { YandexStrategy } from './strategies/yandex.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { UserAuthGuard } from './guards/user-auth-guard.service';
import { ConsultantModule } from '../consultant/consultant.module';
import { ConsultantAuthGuard } from './guards/consultant-auth-guard.service';

@Module({
  exports: [AuthService],
  controllers: [AuthController],
  imports: [
    UsersModule,
    ConsultantModule,
    JwtModule.register({ global: true }),
  ],
  providers: [
    GoogleStrategy,
    YandexStrategy,
    AuthService,
    UserAuthGuard,
    ConsultantAuthGuard,
  ],
})
export class AuthModule {}
