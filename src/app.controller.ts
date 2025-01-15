import { Response } from 'express';
import * as process from 'node:process';
import { Body, Controller, Get, HttpStatus, Post, Res } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  public async app() {
    return 'app started';
  }

  @Get('env')
  public async getFrontendAppsUrls() {
    return {
      YANDEX_CALLBACK_URL: process.env.YANDEX_CALLBACK_URL,
      GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,
      GOOGLE_AUTH_REDIRECT_URL: process.env.GOOGLE_AUTH_REDIRECT_URL,
      YANDEX_AUTH_REDIRECT_URL: process.env.YANDEX_AUTH_REDIRECT_URL,
    };
  }
}
