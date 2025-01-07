import { Types } from 'mongoose';
import { Answer } from './answer.shema';
import { AnswerService } from './answer.service';
import { IRequest } from '../common/types/IRequest';
import { ConsultantAuthGuard } from '../auth/guards/consultant-auth-guard.service';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { QuestionService } from '../question/question.service';

@Controller('answers')
export class AnswerController {
  constructor(
    private readonly answerService: AnswerService,
    private readonly questionService: QuestionService,
  ) {}

  @UseGuards(ConsultantAuthGuard)
  @Get(':id')
  public async get(
    @Param('id') id: string,
    @Req() request: IRequest,
  ): Promise<Answer> {
    if (!id) {
      throw new BadRequestException('answer id is required param');
    }

    const answer = await this.answerService.getAnswerById(id);

    if (!answer) {
      throw new NotFoundException(`answer with id-${id} not found`);
    }

    if (request.user._id.toString() !== answer.author.toString()) {
      throw new ForbiddenException('access denied');
    }

    return answer;
  }

  @UseGuards(ConsultantAuthGuard)
  @Post()
  public async create(
    @Req() request: IRequest,
    @Body() body: { text: string; questionId: string },
  ): Promise<Answer> {
    if (!body.questionId) {
      throw new BadRequestException('questionId is required');
    }

    const question = this.questionService.getQuestionById(body.questionId);

    if (!question) {
      throw new NotFoundException(
        `question with id-${body.questionId} not found`,
      );
    }

    return this.answerService.createAnswer({
      text: body.text,
      authorId: request.user._id,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      questionId: new Types.ObjectId(body.questionId),
    });
  }

  @UseGuards(ConsultantAuthGuard)
  @Patch(':id')
  public async update(
    @Param('id') id: string,
    @Req() request: IRequest,
    @Body() body: { text: string },
  ): Promise<Answer> {
    if (!id) {
      throw new BadRequestException('answer id is required param');
    }

    const answer = await this.answerService.getAnswerById(id);

    if (!answer) {
      throw new NotFoundException(`answer with id-${id} not found`);
    }

    if (request.user._id.toString() !== answer.author.toString()) {
      throw new ForbiddenException('access denied');
    }

    return this.answerService.updateAnswer(id, body);
  }

  @UseGuards(ConsultantAuthGuard)
  @Delete(':id')
  public async delete(
    @Param('id') id: string,
    @Req() request: IRequest,
  ): Promise<Answer> {
    if (!id) {
      throw new BadRequestException('answer id is required param');
    }

    const answer = await this.answerService.getAnswerById(id);

    if (!answer) {
      throw new NotFoundException(`answer with id-${id} not found`);
    }

    if (request.user._id.toString() !== answer.author.toString()) {
      throw new ForbiddenException('access denied');
    }

    await this.answerService.deleteAnswerById(id);

    return answer;
  }

  @UseGuards(ConsultantAuthGuard)
  @Get()
  public async getAll(
    @Req() request: IRequest,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<Answer[]> {
    return this.answerService.getAnswersByAuthorId({
      page,
      limit,
      authorId: request.user._id,
    });
  }
}
