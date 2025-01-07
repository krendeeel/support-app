// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
import { Types } from 'mongoose';
import { Answer } from './answer.shema';
import { AnswerService } from './answer.service';
import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AnswerRepository } from './answer.repository';
import { QuestionRepository } from '../question/question.repository';

describe('AnswerService', () => {
  let service: AnswerService;
  let eventEmitter: EventEmitter2;
  let answerRepository: AnswerRepository;
  let questionRepository: QuestionRepository;

  const mockAnswer = {
    _id: new Types.ObjectId().toHexString(),
    text: 'Test Answer',
    authorId: new Types.ObjectId().toHexString(),
    questionId: new Types.ObjectId().toHexString(),
  };

  const mockQuestion = {
    _id: mockAnswer.questionId,
    author: new Types.ObjectId().toHexString(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnswerService,
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
        {
          provide: AnswerRepository,
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            findOneAndUpdate: jest.fn(),
            deleteOne: jest.fn(),
          },
        },
        {
          provide: QuestionRepository,
          useValue: {
            findOneAndUpdate: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AnswerService>(AnswerService);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
    answerRepository = module.get<AnswerRepository>(AnswerRepository);
    questionRepository = module.get<QuestionRepository>(QuestionRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAnswerById', () => {
    it('should return an answer by id', async () => {
      jest
        .spyOn(answerRepository, 'findOne')
        .mockResolvedValue(mockAnswer as Answer);

      const result = await service.getAnswerById(mockAnswer._id);
      expect(result).toEqual(mockAnswer);
      expect(answerRepository.findOne).toHaveBeenCalledWith({
        _id: mockAnswer._id,
      });
    });
  });

  describe('getAnswersByAuthorId', () => {
    it('should return answers by author id with pagination', async () => {
      const answers = [mockAnswer];
      jest
        .spyOn(answerRepository, 'find')
        .mockResolvedValue(answers as Answer[]);

      const result = await service.getAnswersByAuthorId({
        authorId: mockAnswer.authorId,
        page: 1,
        limit: 10,
      });
      expect(result).toEqual(answers);
      expect(answerRepository.find).toHaveBeenCalledWith(
        { author: mockAnswer.authorId },
        1,
        10,
      );
    });
  });

  describe('createAnswer', () => {
    it('should create an answer and update the question', async () => {
      jest
        .spyOn(answerRepository, 'create')
        .mockResolvedValue(mockAnswer as Answer);
      jest
        .spyOn(questionRepository, 'findOneAndUpdate')
        .mockResolvedValue(mockQuestion);

      const result = await service.createAnswer({
        text: mockAnswer.text,
        authorId: mockAnswer.authorId,
        questionId: mockAnswer.questionId,
      });

      expect(result).toEqual(mockAnswer);
      expect(answerRepository.create).toHaveBeenCalledWith({
        text: mockAnswer.text,
        authorId: mockAnswer.authorId,
        questionId: mockAnswer.questionId,
      });
      expect(questionRepository.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: mockAnswer.questionId },
        { answer: mockAnswer._id },
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'new.answer',
        mockQuestion.author.toString(),
        { id: mockAnswer.questionId },
      );
    });
  });

  describe('updateAnswer', () => {
    it('should update an answer', async () => {
      const updatedAnswer = { ...mockAnswer, text: 'Updated Answer' };
      jest
        .spyOn(answerRepository, 'findOneAndUpdate')
        .mockResolvedValue(updatedAnswer as Answer);

      const result = await service.updateAnswer(mockAnswer._id, {
        text: 'Updated Answer',
      });
      expect(result).toEqual(updatedAnswer);
      expect(answerRepository.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: mockAnswer._id },
        { text: 'Updated Answer' },
      );
    });
  });

  describe('deleteAnswerById', () => {
    it('should delete an answer by id', async () => {
      jest.spyOn(answerRepository, 'deleteOne').mockResolvedValue(true);

      const result = await service.deleteAnswerById(mockAnswer._id);
      expect(result).toBe(true);
      expect(answerRepository.deleteOne).toHaveBeenCalledWith({
        _id: mockAnswer._id,
      });
    });
  });
});
