import { Response } from 'express';
import * as process from 'node:process';
import { IRequest } from '../common/types/IRequest';
import { YandexAuthGuard } from './guards/yandex-auth-guard.service';
import { GoogleAuthGuard } from './guards/google-auth-guard.service';
import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  @UseGuards(GoogleAuthGuard)
  @Get('google/login')
  public async googleLogin() {}

  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  public async googleCallback(
    @Req() request: IRequest,
    @Res() response: Response,
  ) {
    return response.redirect(`${process.env.GOOGLE_AUTH_REDIRECT_URL}?token=${request.user.token}`);
  }

  @UseGuards(YandexAuthGuard)
  @Get('yandex/login')
  public async yandexLogin() {}

  @UseGuards(YandexAuthGuard)
  @Get('yandex/callback')
  public async yandexCallback(
    @Req() request: IRequest,
    @Res() response: Response,
  ) {
    return response.redirect(`${process.env.YANDEX_AUTH_REDIRECT_URL}?token=${request.user.token}`);
  }
}
