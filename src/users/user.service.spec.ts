import { User } from './user.shema';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { Test, TestingModule } from '@nestjs/testing';

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: UsersRepository;

  const mockUser = {
    email: 'test@example.com',
    displayName: 'Test User',
    token: 'mock-token',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            findOneAndUpdate: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    usersRepository = module.get<UsersRepository>(UsersRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUserByEmail', () => {
    it('should return a user by email', async () => {
      jest
        .spyOn(usersRepository, 'findOne')
        .mockResolvedValue(mockUser as User);

      const result = await service.getUserByEmail(mockUser.email);
      expect(result).toEqual(mockUser);
      expect(usersRepository.findOne).toHaveBeenCalledWith({
        email: mockUser.email,
      });
    });
  });

  describe('getAllUser', () => {
    it('should return all users', async () => {
      const users = [mockUser];
      jest.spyOn(usersRepository, 'find').mockResolvedValue(users as User[]);

      const result = await service.getAllUser();
      expect(result).toEqual(users);
      expect(usersRepository.find).toHaveBeenCalledWith({});
    });
  });

  describe('createUser', () => {
    it('should create a user', async () => {
      jest.spyOn(usersRepository, 'create').mockResolvedValue(mockUser as User);

      const result = await service.createUser(
        mockUser.email,
        mockUser.displayName,
        mockUser.token,
      );
      expect(result).toEqual(mockUser);
      expect(usersRepository.create).toHaveBeenCalledWith({
        email: mockUser.email,
        displayName: mockUser.displayName,
        token: mockUser.token,
      });
    });
  });

  describe('updateUser', () => {
    it('should update a user', async () => {
      const updatedUser = { ...mockUser, displayName: 'Updated User' };
      jest
        .spyOn(usersRepository, 'findOneAndUpdate')
        .mockResolvedValue(updatedUser as User);

      const result = await service.updateUser(mockUser.email, {
        displayName: 'Updated User',
      });
      expect(result).toEqual(updatedUser);
      expect(usersRepository.findOneAndUpdate).toHaveBeenCalledWith(
        { email: mockUser.email },
        { displayName: 'Updated User' },
      );
    });
  });
});
