// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
import { Types } from 'mongoose';
import { Reflector } from '@nestjs/core';
import { AnswerService } from './answer.service';
import { Test, TestingModule } from '@nestjs/testing';
import { AnswerController } from './answer.controller';
import { QuestionService } from '../question/question.service';
import { ConsultantAuthGuard } from '../auth/guards/consultant-auth-guard.service';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

describe('AnswerController', () => {
  let controller: AnswerController;
  let answerService: AnswerService;
  let questionService: QuestionService;

  const mockConsultantAuthGuard = {
    canActivate: jest.fn(() => true),
  };

  const validQuestionId = new Types.ObjectId().toHexString();
  const validAnswerId = new Types.ObjectId().toHexString();
  const validAuthorId = new Types.ObjectId().toHexString();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnswerController],
      providers: [
        {
          provide: AnswerService,
          useValue: {
            getAnswerById: jest.fn(),
            createAnswer: jest.fn(),
            updateAnswer: jest.fn(),
            deleteAnswerById: jest.fn(),
            getAnswersByAuthorId: jest.fn(),
          },
        },
        {
          provide: QuestionService,
          useValue: {
            getQuestionById: jest.fn(),
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
      .overrideGuard(ConsultantAuthGuard)
      .useValue(mockConsultantAuthGuard)
      .compile();

    controller = module.get<AnswerController>(AnswerController);
    answerService = module.get<AnswerService>(AnswerService);
    questionService = module.get<QuestionService>(QuestionService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('get', () => {
    it('should throw BadRequestException if id is not provided', async () => {
      await expect(
        controller.get('', { user: { _id: validAuthorId } }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if answer is not found', async () => {
      jest.spyOn(answerService, 'getAnswerById').mockResolvedValue(null);
      await expect(
        controller.get(validAnswerId, { user: { _id: validAuthorId } }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not the author', async () => {
      const answer = { author: new Types.ObjectId().toHexString() };
      jest.spyOn(answerService, 'getAnswerById').mockResolvedValue(answer);
      await expect(
        controller.get(validAnswerId, { user: { _id: validAuthorId } }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should return the answer if user is the author', async () => {
      const answer = { author: validAuthorId };
      jest.spyOn(answerService, 'getAnswerById').mockResolvedValue(answer);
      const result = await controller.get(validAnswerId, {
        user: { _id: validAuthorId },
      });
      expect(result).toEqual(answer);
    });
  });

  describe('create', () => {
    it('should throw BadRequestException if questionId is not provided', async () => {
      await expect(
        controller.create(
          { user: { _id: validAuthorId } },
          { text: 'Test answer' },
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create an answer if question exists', async () => {
      const question = { _id: validQuestionId };
      const answer = {
        text: 'Test answer',
        authorId: validAuthorId,
        questionId: new Types.ObjectId(validQuestionId),
      };
      jest
        .spyOn(questionService, 'getQuestionById')
        .mockResolvedValue(question);
      jest.spyOn(answerService, 'createAnswer').mockResolvedValue(answer);
      const result = await controller.create(
        { user: { _id: validAuthorId } },
        { text: 'Test answer', questionId: validQuestionId },
      );
      expect(result).toEqual(answer);
    });
  });

  describe('update', () => {
    it('should throw BadRequestException if id is not provided', async () => {
      await expect(
        controller.update(
          '',
          { user: { _id: validAuthorId } },
          { text: 'Updated answer' },
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if answer is not found', async () => {
      jest.spyOn(answerService, 'getAnswerById').mockResolvedValue(null);
      await expect(
        controller.update(
          validAnswerId,
          { user: { _id: validAuthorId } },
          { text: 'Updated answer' },
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not the author', async () => {
      const answer = { author: new Types.ObjectId().toHexString() };
      jest.spyOn(answerService, 'getAnswerById').mockResolvedValue(answer);
      await expect(
        controller.update(
          validAnswerId,
          { user: { _id: validAuthorId } },
          { text: 'Updated answer' },
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should update the answer if user is the author', async () => {
      const answer = { author: validAuthorId };
      jest.spyOn(answerService, 'getAnswerById').mockResolvedValue(answer);
      jest.spyOn(answerService, 'updateAnswer').mockResolvedValue(answer);
      const result = await controller.update(
        validAnswerId,
        { user: { _id: validAuthorId } },
        {
          text: 'Updated answer',
        },
      );
      expect(result).toEqual(answer);
    });
  });

  describe('delete', () => {
    it('should throw BadRequestException if id is not provided', async () => {
      await expect(
        controller.delete('', { user: { _id: validAuthorId } }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if answer is not found', async () => {
      jest.spyOn(answerService, 'getAnswerById').mockResolvedValue(null);
      await expect(
        controller.delete(validAnswerId, { user: { _id: validAuthorId } }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not the author', async () => {
      const answer = { author: new Types.ObjectId().toHexString() };
      jest.spyOn(answerService, 'getAnswerById').mockResolvedValue(answer);
      await expect(
        controller.delete(validAnswerId, { user: { _id: validAuthorId } }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should delete the answer if user is the author', async () => {
      const answer = { author: validAuthorId };
      jest.spyOn(answerService, 'getAnswerById').mockResolvedValue(answer);
      jest.spyOn(answerService, 'deleteAnswerById').mockResolvedValue(answer);
      const result = await controller.delete(validAnswerId, {
        user: { _id: validAuthorId },
      });
      expect(result).toEqual(answer);
    });
  });

  describe('getAll', () => {
    it('should return all answers by author', async () => {
      const answers = [{ text: 'Test answer 1' }, { text: 'Test answer 2' }];
      jest
        .spyOn(answerService, 'getAnswersByAuthorId')
        .mockResolvedValue(answers);
      const result = await controller.getAll(
        { user: { _id: validAuthorId } },
        1,
        10,
      );
      expect(result).toEqual(answers);
    });
  });
});
