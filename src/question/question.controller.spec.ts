// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
import { Reflector } from '@nestjs/core';
import { QuestionService } from './question.service';
import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { QuestionController } from './question.controller';
import { UserAuthGuard } from '../auth/guards/user-auth-guard.service';
import { ConsultantAuthGuard } from '../auth/guards/consultant-auth-guard.service';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

describe('QuestionController', () => {
  let controller: QuestionController;
  let questionService: QuestionService;

  const mockUserAuthGuard = {
    canActivate: jest.fn(() => true),
  };

  const mockConsultantAuthGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuestionController],
      providers: [
        {
          provide: QuestionService,
          useValue: {
            getQuestionById: jest.fn(),
            createQuestion: jest.fn(),
            updateQuestion: jest.fn(),
            deleteQuestionById: jest.fn(),
            getAllQuestions: jest.fn(),
            getQuestionsByAuthorId: jest.fn(),
          },
        },
        {
          provide: EventEmitter2,
          useValue: {
            on: jest.fn(),
          },
        },
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(UserAuthGuard)
      .useValue(mockUserAuthGuard)
      .overrideGuard(ConsultantAuthGuard)
      .useValue(mockConsultantAuthGuard)
      .compile();

    controller = module.get<QuestionController>(QuestionController);
    questionService = module.get<QuestionService>(QuestionService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('get', () => {
    it('should throw BadRequestException if id is not provided', async () => {
      await expect(
        controller.get('', { user: { _id: '123' } }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if question is not found', async () => {
      jest.spyOn(questionService, 'getQuestionById').mockResolvedValue(null);
      await expect(
        controller.get('123', { user: { _id: '123' } }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not the author', async () => {
      const question = { author: '456' };
      jest
        .spyOn(questionService, 'getQuestionById')
        .mockResolvedValue(question);
      await expect(
        controller.get('123', { user: { _id: '123' } }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should return the question if user is the author', async () => {
      const question = { author: '123' };
      jest
        .spyOn(questionService, 'getQuestionById')
        .mockResolvedValue(question);
      const result = await controller.get('123', { user: { _id: '123' } });
      expect(result).toEqual(question);
    });
  });

  describe('create', () => {
    it('should create a question', async () => {
      const question = { text: 'Test question', authorId: '123' };
      jest.spyOn(questionService, 'createQuestion').mockResolvedValue(question);
      const result = await controller.create(
        { user: { _id: '123' } },
        {
          text: 'Test question',
        },
      );
      expect(result).toEqual(question);
    });
  });

  describe('update', () => {
    it('should throw BadRequestException if id is not provided', async () => {
      await expect(
        controller.update(
          '',
          { user: { _id: '123' } },
          { text: 'Updated question' },
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if question is not found', async () => {
      jest.spyOn(questionService, 'getQuestionById').mockResolvedValue(null);
      await expect(
        controller.update(
          '123',
          { user: { _id: '123' } },
          { text: 'Updated question' },
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not the author', async () => {
      const question = { author: '456' };
      jest
        .spyOn(questionService, 'getQuestionById')
        .mockResolvedValue(question);
      await expect(
        controller.update(
          '123',
          { user: { _id: '123' } },
          { text: 'Updated question' },
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should update the question if user is the author', async () => {
      const question = { author: '123' };
      jest
        .spyOn(questionService, 'getQuestionById')
        .mockResolvedValue(question);
      jest.spyOn(questionService, 'updateQuestion').mockResolvedValue(question);
      const result = await controller.update(
        '123',
        { user: { _id: '123' } },
        {
          text: 'Updated question',
        },
      );
      expect(result).toEqual(question);
    });
  });

  describe('delete', () => {
    it('should throw BadRequestException if id is not provided', async () => {
      await expect(
        controller.delete('', { user: { _id: '123' } }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if question is not found', async () => {
      jest.spyOn(questionService, 'getQuestionById').mockResolvedValue(null);
      await expect(
        controller.delete('123', { user: { _id: '123' } }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not the author', async () => {
      const question = { author: '456' };
      jest
        .spyOn(questionService, 'getQuestionById')
        .mockResolvedValue(question);
      await expect(
        controller.delete('123', { user: { _id: '123' } }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should delete the question if user is the author', async () => {
      const question = { author: '123' };
      jest
        .spyOn(questionService, 'getQuestionById')
        .mockResolvedValue(question);
      jest
        .spyOn(questionService, 'deleteQuestionById')
        .mockResolvedValue(question);
      const result = await controller.delete('123', { user: { _id: '123' } });
      expect(result).toEqual(question);
    });
  });

  describe('getAll', () => {
    it('should return all questions', async () => {
      const questions = [
        { text: 'Test question 1' },
        { text: 'Test question 2' },
      ];
      jest
        .spyOn(questionService, 'getAllQuestions')
        .mockResolvedValue(questions);
      const result = await controller.getAll(1, 10);
      expect(result).toEqual(questions);
    });
  });

  describe('getAllByUser', () => {
    it('should return all questions by user', async () => {
      const questions = [
        { text: 'Test question 1' },
        { text: 'Test question 2' },
      ];
      jest
        .spyOn(questionService, 'getQuestionsByAuthorId')
        .mockResolvedValue(questions);
      const result = await controller.getAllByUser(
        { user: { _id: '123' } },
        1,
        10,
      );
      expect(result).toEqual(questions);
    });
  });
});
