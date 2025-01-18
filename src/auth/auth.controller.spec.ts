// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { AuthController } from './auth.controller';
import { Test, TestingModule } from '@nestjs/testing';
import { GoogleAuthGuard } from './guards/google-auth-guard.service';
import { YandexAuthGuard } from './guards/yandex-auth-guard.service';

describe('AuthController', () => {
  let controller: AuthController;

  const mockGoogleAuthGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  const mockYandexAuthGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  const mockRequest = {
    user: {
      token: 'mock-token',
    },
  };

  const mockResponse = {
    redirect: jest.fn().mockReturnThis(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
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

  describe('googleCallback', () => {
    it('should redirect with token', async () => {
      process.env.GOOGLE_AUTH_REDIRECT_URL = 'http://example.com';
      await controller.googleCallback(mockRequest, mockResponse);
      expect(mockResponse.redirect).toHaveBeenCalledWith(
        'http://example.com?token=mock-token',
      );
    });
  });

  describe('yandexCallback', () => {
    it('should redirect with token', async () => {
      process.env.YANDEX_AUTH_REDIRECT_URL = 'http://example.com';
      await controller.yandexCallback(mockRequest, mockResponse);
      expect(mockResponse.redirect).toHaveBeenCalledWith(
        'http://example.com?token=mock-token',
      );
    });
  });
});
