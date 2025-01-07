// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
import { Test, TestingModule } from '@nestjs/testing';
import { ConsultantService } from './consultant.service';
import { ConsultantRepository } from './consultant.repository';

describe('ConsultantService', () => {
  let service: ConsultantService;
  let consultantRepository: ConsultantRepository;

  const mockConsultant = {
    email: 'test@example.com',
    displayName: 'Test Consultant',
    token: 'mock-token',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConsultantService,
        {
          provide: ConsultantRepository,
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            findOneAndUpdate: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ConsultantService>(ConsultantService);
    consultantRepository =
      module.get<ConsultantRepository>(ConsultantRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getConsultantByEmail', () => {
    it('should return a consultant by email', async () => {
      jest
        .spyOn(consultantRepository, 'findOne')
        .mockResolvedValue(mockConsultant);

      const result = await service.getConsultantByEmail(mockConsultant.email);
      expect(result).toEqual(mockConsultant);
      expect(consultantRepository.findOne).toHaveBeenCalledWith({
        email: mockConsultant.email,
      });
    });
  });

  describe('getAllConsultants', () => {
    it('should return all consultants', async () => {
      const consultants = [mockConsultant];
      jest.spyOn(consultantRepository, 'find').mockResolvedValue(consultants);

      const result = await service.getAllConsultants();
      expect(result).toEqual(consultants);
      expect(consultantRepository.find).toHaveBeenCalledWith({});
    });
  });

  describe('createConsultant', () => {
    it('should create a consultant', async () => {
      jest
        .spyOn(consultantRepository, 'create')
        .mockResolvedValue(mockConsultant);

      const result = await service.createConsultant(
        mockConsultant.email,
        mockConsultant.displayName,
        mockConsultant.token,
      );
      expect(result).toEqual(mockConsultant);
      expect(consultantRepository.create).toHaveBeenCalledWith({
        email: mockConsultant.email,
        displayName: mockConsultant.displayName,
        token: mockConsultant.token,
      });
    });
  });

  describe('updateConsultant', () => {
    it('should update a consultant', async () => {
      const updatedConsultant = {
        ...mockConsultant,
        displayName: 'Updated Consultant',
      };
      jest
        .spyOn(consultantRepository, 'findOneAndUpdate')
        .mockResolvedValue(updatedConsultant);

      const result = await service.updateConsultant(mockConsultant.email, {
        displayName: 'Updated Consultant',
      });
      expect(result).toEqual(updatedConsultant);
      expect(consultantRepository.findOneAndUpdate).toHaveBeenCalledWith(
        { email: mockConsultant.email },
        { displayName: 'Updated Consultant' },
      );
    });
  });
});
