// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/user.shema';
import { AuthService } from './auth.service';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users/users.service';
import { Consultant } from '../consultant/consultant.shema';
import { ConsultantService } from '../consultant/consultant.service';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let usersService: UsersService;
  let consultantService: ConsultantService;

  const mockGoogleUser = {
    email: 'test@example.com',
    name: 'Test User',
  };

  const mockYandexUser = {
    email: 'consultant@example.com',
    name: 'Test Consultant',
  };

  const mockToken = 'mock-token';
  const mockTokenHash = 'mock-token-hash';

  const mockUser = {
    email: mockGoogleUser.email,
    displayName: mockGoogleUser.name,
    token: mockTokenHash,
  };

  const mockConsultant = {
    email: mockYandexUser.email,
    displayName: mockYandexUser.name,
    token: mockTokenHash,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue(mockToken),
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
    jwtService = module.get<JwtService>(JwtService);
    usersService = module.get<UsersService>(UsersService);
    consultantService = module.get<ConsultantService>(ConsultantService);

    jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true);
    jest.spyOn(bcrypt, 'genSalt').mockImplementation(async () => 'mock-salt');
    jest.spyOn(bcrypt, 'hash').mockImplementation(async () => mockTokenHash);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateGoogleUser', () => {
    it('should return an existing user with a new token', async () => {
      jest
        .spyOn(usersService, 'getUserByEmail')
        .mockResolvedValue(mockUser as User);
      jest
        .spyOn(usersService, 'updateUser')
        .mockResolvedValue(mockUser as User);

      const result = await service.validateGoogleUser(mockGoogleUser);

      expect(result).toEqual({
        ...mockUser,
        token: mockToken,
      });
      expect(jwtService.signAsync).toHaveBeenCalledWith(mockGoogleUser, {
        secret: process.env.JWT_SECRET_KEY,
        expiresIn: process.env.JWT_EXPIRES_IN,
      });
      expect(usersService.getUserByEmail).toHaveBeenCalledWith(
        mockGoogleUser.email,
      );
      expect(usersService.updateUser).toHaveBeenCalledWith(mockUser.email, {
        token: mockTokenHash,
      });
    });

    it('should create a new user if one does not exist', async () => {
      jest.spyOn(usersService, 'getUserByEmail').mockResolvedValue(null);
      jest
        .spyOn(usersService, 'createUser')
        .mockResolvedValue(mockUser as User);

      const result = await service.validateGoogleUser(mockGoogleUser);

      expect(result).toEqual({
        ...mockUser,
        token: mockToken,
      });
      expect(jwtService.signAsync).toHaveBeenCalledWith(mockGoogleUser, {
        secret: process.env.JWT_SECRET_KEY,
        expiresIn: process.env.JWT_EXPIRES_IN,
      });
      expect(usersService.getUserByEmail).toHaveBeenCalledWith(
        mockGoogleUser.email,
      );
      expect(usersService.createUser).toHaveBeenCalledWith(
        mockGoogleUser.email,
        mockGoogleUser.name,
        mockTokenHash,
      );
    });
  });

  describe('validateYandexUser', () => {
    it('should return an existing consultant with a new token', async () => {
      jest
        .spyOn(consultantService, 'getConsultantByEmail')
        .mockResolvedValue(mockConsultant as Consultant);
      jest
        .spyOn(consultantService, 'updateConsultant')
        .mockResolvedValue(mockConsultant as Consultant);

      const result = await service.validateYandexUser(mockYandexUser);

      expect(result).toEqual({
        ...mockConsultant,
        token: mockToken,
      });
      expect(jwtService.signAsync).toHaveBeenCalledWith(mockYandexUser, {
        secret: process.env.JWT_SECRET_KEY,
        expiresIn: process.env.JWT_EXPIRES_IN,
      });
      expect(consultantService.getConsultantByEmail).toHaveBeenCalledWith(
        mockYandexUser.email,
      );
      expect(consultantService.updateConsultant).toHaveBeenCalledWith(
        mockConsultant.email,
        {
          token: mockTokenHash,
        },
      );
    });

    it('should create a new consultant if one does not exist', async () => {
      jest
        .spyOn(consultantService, 'getConsultantByEmail')
        .mockResolvedValue(null);
      jest
        .spyOn(consultantService, 'createConsultant')
        .mockResolvedValue(mockConsultant as Consultant);

      const result = await service.validateYandexUser(mockYandexUser);

      expect(result).toEqual({
        ...mockConsultant,
        token: mockToken,
      });
      expect(jwtService.signAsync).toHaveBeenCalledWith(mockYandexUser, {
        secret: process.env.JWT_SECRET_KEY,
        expiresIn: process.env.JWT_EXPIRES_IN,
      });
      expect(consultantService.getConsultantByEmail).toHaveBeenCalledWith(
        mockYandexUser.email,
      );
      expect(consultantService.createConsultant).toHaveBeenCalledWith(
        mockYandexUser.email,
        mockYandexUser.name,
        mockTokenHash,
      );
    });
  });

  describe('compareToken', () => {
    it('should return true if tokens match', async () => {
      const result = await service.compareToken(mockToken, mockTokenHash);
      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith(mockToken, mockTokenHash);
    });

    it('should return false if tokens do not match', async () => {
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => false);

      const result = await service.compareToken(mockToken, 'wrong-token-hash');
      expect(result).toBe(false);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        mockToken,
        'wrong-token-hash',
      );
    });
  });

  describe('generateTokenHash', () => {
    it('should generate a token hash', async () => {
      const result = await service.generateTokenHash(mockToken);
      expect(result).toBe(mockTokenHash);
      expect(bcrypt.genSalt).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith(mockToken, 'mock-salt');
    });
  });
});
