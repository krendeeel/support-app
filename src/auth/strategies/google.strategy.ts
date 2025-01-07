import * as process from 'node:process';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      scope: ['email', 'profile'],
      clientID: process.env.GOOGLE_CLIENT_ID,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
  ) {
    return this.authService.validateGoogleUser({
      name: profile.displayName,
      email: profile.emails[0].value,
    });
  }
}
