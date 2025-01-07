import { Response } from 'express';
import { Reflector } from '@nestjs/core';
import { AuthController } from './auth.controller';
import { IRequest } from '../common/types/IRequest';
import { Test, TestingModule } from '@nestjs/testing';
import { GoogleAuthGuard } from './guards/google-auth-guard.service';
import { YandexAuthGuard } from './guards/yandex-auth-guard.service';

describe('AuthController', () => {
  let controller: AuthController;

  const mockGoogleAuthGuard = {
    canActivate: jest.fn(() => true),
  };

  const mockYandexAuthGuard = {
    canActivate: jest.fn(() => true),
  };

  const mockResponse = {
    cookie: jest.fn().mockReturnThis(),
    redirect: jest.fn().mockReturnThis(),
  } as unknown as Response;

  const mockRequest = {
    user: {
      token: 'mock-token',
    },
  } as IRequest;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(GoogleAuthGuard)
      .useValue(mockGoogleAuthGuard)
      .overrideGuard(YandexAuthGuard)
      .useValue(mockYandexAuthGuard)
      .compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('googleLogin', () => {
    it('should call GoogleAuthGuard', async () => {
      const result = await controller.googleLogin();
      expect(result).toBeUndefined();
    });
  });

  describe('googleCallback', () => {
    it('should set a cookie and redirect', async () => {
      process.env.GOOGLE_AUTH_REDIRECT_URL = 'http://example.com';

      await controller.googleCallback(mockRequest, mockResponse);

      expect(mockResponse.cookie).toHaveBeenCalledWith('token', 'mock-token', {
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60 * 24,
      });

      expect(mockResponse.redirect).toHaveBeenCalledWith('http://example.com');
    });
  });

  describe('yandexLogin', () => {
    it('should call YandexAuthGuard', async () => {
      const result = await controller.yandexLogin();
      expect(result).toBeUndefined();
    });
  });

  describe('yandexCallback', () => {
    it('should set a cookie and redirect', async () => {
      process.env.YANDEX_AUTH_REDIRECT_URL = 'http://example-yandex.com';

      await controller.yandexCallback(mockRequest, mockResponse);

      expect(mockResponse.cookie).toHaveBeenCalledWith('token', 'mock-token', {
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60 * 24,
      });

      expect(mockResponse.redirect).toHaveBeenCalledWith(
        'http://example-yandex.com',
      );
    });
  });
});
