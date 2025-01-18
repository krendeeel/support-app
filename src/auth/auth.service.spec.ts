// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users/users.service';
import { ConsultantService } from '../consultant/consultant.service';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: jest.Mocked<JwtService>;
  let usersService: jest.Mocked<UsersService>;
  let consultantService: jest.Mocked<ConsultantService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            getUserByEmail: jest.fn(),
            updateUser: jest.fn(),
            createUser: jest.fn(),
          },
        },
        {
          provide: ConsultantService,
          useValue: {
            getConsultantByEmail: jest.fn(),
            updateConsultant: jest.fn(),
            createConsultant: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get(JwtService);
    usersService = module.get(UsersService);
    consultantService = module.get(ConsultantService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateGoogleUser', () => {
    it('should return an existing user with a new token', async () => {
      const mockGoogleUser = { email: 'test@example.com', name: 'Test User' };
      const mockToken = 'mockToken';
      const mockTokenHash = 'mockTokenHash';
      const mockUser = {
        email: 'test@example.com',
        name: 'Test User',
        token: 'oldToken',
      };

      jwtService.signAsync.mockResolvedValue(mockToken);
      bcrypt.hash.mockResolvedValue(mockTokenHash);
      usersService.getUserByEmail.mockResolvedValue(mockUser);
      usersService.updateUser.mockResolvedValue({
        ...mockUser,
        token: mockTokenHash,
      });

      const result = await service.validateGoogleUser(mockGoogleUser);

      expect(result).toEqual({ ...mockUser, token: mockToken });
      expect(jwtService.signAsync).toHaveBeenCalledWith(mockGoogleUser, {
        secret: process.env.JWT_SECRET_KEY,
        expiresIn: process.env.JWT_EXPIRES_IN,
      });
      expect(usersService.getUserByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(usersService.updateUser).toHaveBeenCalledWith('test@example.com', {
        token: mockTokenHash,
      });
    });

    it('should create and return a new user with a token', async () => {
      const mockGoogleUser = { email: 'test@example.com', name: 'Test User' };
      const mockToken = 'mockToken';
      const mockTokenHash = 'mockTokenHash';
      const mockUser = {
        email: 'test@example.com',
        name: 'Test User',
        token: mockTokenHash,
      };

      jwtService.signAsync.mockResolvedValue(mockToken);
      bcrypt.hash.mockResolvedValue(mockTokenHash);
      usersService.getUserByEmail.mockResolvedValue(null);
      usersService.createUser.mockResolvedValue(mockUser);

      const result = await service.validateGoogleUser(mockGoogleUser);

      expect(result).toEqual({ ...mockUser, token: mockToken });
      expect(usersService.createUser).toHaveBeenCalledWith(
        'test@example.com',
        'Test User',
        mockTokenHash,
      );
    });
  });

  describe('validateYandexUser', () => {
    it('should return an existing consultant with a new token', async () => {
      const mockYandexUser = {
        email: 'test@example.com',
        name: 'Test Consultant',
      };
      const mockToken = 'mockToken';
      const mockTokenHash = 'mockTokenHash';
      const mockConsultant = {
        email: 'test@example.com',
        name: 'Test Consultant',
        token: 'oldToken',
      };

      jwtService.signAsync.mockResolvedValue(mockToken);
      bcrypt.hash.mockResolvedValue(mockTokenHash);
      consultantService.getConsultantByEmail.mockResolvedValue(mockConsultant);
      consultantService.updateConsultant.mockResolvedValue({
        ...mockConsultant,
        token: mockTokenHash,
      });

      const result = await service.validateYandexUser(mockYandexUser);

      expect(result).toEqual({ ...mockConsultant, token: mockToken });
      expect(jwtService.signAsync).toHaveBeenCalledWith(mockYandexUser, {
        secret: process.env.JWT_SECRET_KEY,
        expiresIn: process.env.JWT_EXPIRES_IN,
      });
      expect(consultantService.getConsultantByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(consultantService.updateConsultant).toHaveBeenCalledWith(
        'test@example.com',
        { token: mockTokenHash },
      );
    });

    it('should create and return a new consultant with a token', async () => {
      const mockYandexUser = {
        email: 'test@example.com',
        name: 'Test Consultant',
      };
      const mockToken = 'mockToken';
      const mockTokenHash = 'mockTokenHash';
      const mockConsultant = {
        email: 'test@example.com',
        name: 'Test Consultant',
        token: mockTokenHash,
      };

      jwtService.signAsync.mockResolvedValue(mockToken);
      bcrypt.hash.mockResolvedValue(mockTokenHash);
      consultantService.getConsultantByEmail.mockResolvedValue(null);
      consultantService.createConsultant.mockResolvedValue(mockConsultant);

      const result = await service.validateYandexUser(mockYandexUser);

      expect(result).toEqual({ ...mockConsultant, token: mockToken });
      expect(consultantService.createConsultant).toHaveBeenCalledWith(
        'test@example.com',
        'Test Consultant',
        mockTokenHash,
      );
    });
  });

  describe('compareToken', () => {
    it('should return true if tokens match', async () => {
      const token = 'mockToken';
      const tokenHash = 'mockTokenHash';

      bcrypt.compare.mockResolvedValue(true);

      const result = await service.compareToken(token, tokenHash);
      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith(token, tokenHash);
    });

    it('should return false if tokens do not match', async () => {
      const token = 'mockToken';
      const tokenHash = 'mockTokenHash';

      bcrypt.compare.mockResolvedValue(false);

      const result = await service.compareToken(token, tokenHash);
      expect(result).toBe(false);
      expect(bcrypt.compare).toHaveBeenCalledWith(token, tokenHash);
    });
  });

  describe('generateTokenHash', () => {
    it('should generate a token hash', async () => {
      const token = 'mockToken';
      const tokenHash = 'mockTokenHash';

      bcrypt.genSalt.mockResolvedValue('mockSalt');
      bcrypt.hash.mockResolvedValue(tokenHash);

      const result = await service.generateTokenHash(token);
      expect(result).toBe(tokenHash);
      expect(bcrypt.hash).toHaveBeenCalledWith(token, 'mockSalt');
    });
  });
});
