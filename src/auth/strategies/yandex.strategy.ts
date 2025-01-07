import * as process from 'node:process';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-yandex';

@Injectable()
export class YandexStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      clientID: process.env.YANDEX_CLIENT_ID,
      callbackURL: process.env.YANDEX_CALLBACK_URL,
      clientSecret: process.env.YANDEX_CLIENT_SECRET,
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
  ) {
    return this.authService.validateYandexUser({
      name: profile.displayName,
      email: profile.emails[0].value,
    });
  }
}
