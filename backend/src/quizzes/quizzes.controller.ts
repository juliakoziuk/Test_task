import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUserId } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { ListQuizzesQueryDto } from './dto/list-quizzes-query.dto';
import { QuizDetailDto, QuizSummaryDto } from './dto/quiz-response.dto';
import { QuizzesService } from './quizzes.service';

@ApiTags('quizzes')
@Controller('quizzes')
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new quiz owned by the authenticated user' })
  @ApiCreatedResponse({ type: QuizDetailDto })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  create(@Body() dto: CreateQuizDto, @CurrentUserId() userId: number) {
    return this.quizzesService.create(dto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'List all quizzes with their question count' })
  @ApiOkResponse({ type: [QuizSummaryDto] })
  findAll(@Query() query: ListQuizzesQueryDto) {
    return this.quizzesService.findAll(query.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a quiz with all its questions (correct answers are not included)' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiOkResponse({ type: QuizDetailDto })
  @ApiNotFoundResponse({ description: 'Quiz not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.quizzesService.findOne(id);
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete one of your own quizzes' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiNoContentResponse({ description: 'Quiz deleted' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'The quiz belongs to another user' })
  @ApiNotFoundResponse({ description: 'Quiz not found' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUserId() userId: number) {
    return this.quizzesService.remove(id, userId);
  }
}
