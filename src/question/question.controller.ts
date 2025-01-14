import { Response } from 'express';
import { map, Subject } from 'rxjs';
import { Question } from './question.shema';
import { IRequest } from '../common/types/IRequest';
import { QuestionService } from './question.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserAuthGuard } from '../auth/guards/user-auth-guard.service';
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
  Res,
  Sse,
  UseGuards,
} from '@nestjs/common';

@Controller('questions')
export class QuestionController {
  private userStreams: { [userId: string]: Subject<{ id: string }> } = {};

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly questionService: QuestionService,
  ) {
    this.eventEmitter.on('new.answer', (userId, answer) => {
      if (this.userStreams[userId]) {
        this.userStreams[userId].next(answer);
      }
    });
  }

  @UseGuards(ConsultantAuthGuard)
  @Get('all')
  public async getAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<Question[]> {
    return this.questionService.getAllQuestions({
      page,
      limit,
    });
  }

  @UseGuards(UserAuthGuard)
  @Get(':id')
  public async get(
    @Param('id') id: string,
    @Req() request: IRequest,
  ): Promise<Question> {
    if (!id) {
      throw new BadRequestException('question id is required param');
    }

    const question = await this.questionService.getQuestionById(id);

    if (!question) {
      throw new NotFoundException(`question with id-${id} not found`);
    }

    if (request.user._id.toString() !== question.author.toString()) {
      throw new ForbiddenException('access denied');
    }

    return question;
  }

  @UseGuards(UserAuthGuard)
  @Post()
  public async create(
    @Req() request: IRequest,
    @Body() body: { text: string },
  ): Promise<Question> {
    return this.questionService.createQuestion({
      text: body.text,
      authorId: request.user._id,
    });
  }

  @UseGuards(UserAuthGuard)
  @Patch(':id')
  public async update(
    @Param('id') id: string,
    @Req() request: IRequest,
    @Body() body: { text: string },
  ): Promise<Question> {
    if (!id) {
      throw new BadRequestException('question id is required param');
    }

    const question = await this.questionService.getQuestionById(id);

    if (!question) {
      throw new NotFoundException(`question with id-${id} not found`);
    }

    if (request.user._id.toString() !== question.author.toString()) {
      throw new ForbiddenException('access denied');
    }

    return this.questionService.updateQuestion(id, body);
  }

  @UseGuards(UserAuthGuard)
  @Delete(':id')
  public async delete(
    @Param('id') id: string,
    @Req() request: IRequest,
  ): Promise<Question> {
    if (!id) {
      throw new BadRequestException('question id is required param');
    }

    const question = await this.questionService.getQuestionById(id);

    if (!question) {
      throw new NotFoundException(`question with id-${id} not found`);
    }

    if (request.user._id.toString() !== question.author.toString()) {
      throw new ForbiddenException('access denied');
    }

    await this.questionService.deleteQuestionById(id);

    return question;
  }

  @UseGuards(UserAuthGuard)
  @Get()
  public async getAllByUser(
    @Req() request: IRequest,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<Question[]> {
    return this.questionService.getQuestionsByAuthorId({
      page,
      limit,
      authorId: request.user._id,
    });
  }

  @UseGuards(UserAuthGuard)
  @Get('sse')
  @Sse()
  sseNotifications(@Req() request: IRequest, @Res() response: Response) {
    const userId = request.user._id.toString();
    if (!this.userStreams[userId]) {
      this.userStreams[userId] = new Subject();
    }

    response.on('close', () => {
      if (this.userStreams[userId]) {
        this.userStreams[userId].complete();
        delete this.userStreams[userId];
      }
    });

    return this.userStreams[userId]
      .asObservable()
      .pipe(map((data) => ({ data: JSON.stringify(data) })));
  }
}
