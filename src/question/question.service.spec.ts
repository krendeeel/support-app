// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { Types } from 'mongoose';
import { QuestionService } from './question.service';
import { Test, TestingModule } from '@nestjs/testing';
import { QuestionRepository } from './question.repository';

describe('QuestionService', () => {
  let service: QuestionService;
  let questionRepository: QuestionRepository;

  const mockQuestion = {
    _id: new Types.ObjectId().toHexString(),
    text: 'Test question',
    author: new Types.ObjectId().toHexString(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuestionService,
        {
          provide: QuestionRepository,
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            findOneAndUpdate: jest.fn(),
            deleteOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<QuestionService>(QuestionService);
    questionRepository = module.get<QuestionRepository>(QuestionRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getQuestionById', () => {
    it('should return a question by id', async () => {
      jest.spyOn(questionRepository, 'findOne').mockResolvedValue(mockQuestion);

      const result = await service.getQuestionById(mockQuestion._id);
      expect(result).toEqual(mockQuestion);
      expect(questionRepository.findOne).toHaveBeenCalledWith({
        _id: mockQuestion._id,
      });
    });
  });

  describe('getAllQuestions', () => {
    it('should return all questions with pagination', async () => {
      const questions = [mockQuestion];
      jest.spyOn(questionRepository, 'find').mockResolvedValue(questions);

      const result = await service.getAllQuestions({ page: 1, limit: 10 });
      expect(result).toEqual(questions);
      expect(questionRepository.find).toHaveBeenCalledWith({}, 1, 10);
    });
  });

  describe('getQuestionsByAuthorId', () => {
    it('should return questions by author id with pagination', async () => {
      const questions = [mockQuestion];
      jest.spyOn(questionRepository, 'find').mockResolvedValue(questions);

      const authorId = new Types.ObjectId().toHexString();
      const result = await service.getQuestionsByAuthorId({
        authorId,
        page: 1,
        limit: 10,
      });
      expect(result).toEqual(questions);
      expect(questionRepository.find).toHaveBeenCalledWith(
        { author: authorId },
        1,
        10,
      );
    });
  });

  describe('createQuestion', () => {
    it('should create a question', async () => {
      jest.spyOn(questionRepository, 'create').mockResolvedValue(mockQuestion);

      const result = await service.createQuestion({
        text: 'Test question',
        authorId: mockQuestion.author,
      });
      expect(result).toEqual(mockQuestion);
      expect(questionRepository.create).toHaveBeenCalledWith({
        text: 'Test question',
        authorId: mockQuestion.author,
      });
    });
  });

  describe('updateQuestion', () => {
    it('should update a question', async () => {
      const updatedQuestion = { ...mockQuestion, text: 'Updated question' };
      jest
        .spyOn(questionRepository, 'findOneAndUpdate')
        .mockResolvedValue(updatedQuestion);

      const result = await service.updateQuestion(mockQuestion._id, {
        text: 'Updated question',
      });
      expect(result).toEqual(updatedQuestion);
      expect(questionRepository.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: mockQuestion._id },
        { text: 'Updated question' },
      );
    });
  });

  describe('deleteQuestionById', () => {
    it('should delete a question by id', async () => {
      jest.spyOn(questionRepository, 'deleteOne').mockResolvedValue(true);

      const result = await service.deleteQuestionById(mockQuestion._id);
      expect(result).toBe(true);
      expect(questionRepository.deleteOne).toHaveBeenCalledWith({
        _id: mockQuestion._id,
      });
    });
  });
});
