import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AttemptsService } from '../attempts/attempts.service';
import { AttemptDetailDto, AttemptSummaryDto } from '../attempts/dto/attempt-response.dto';
import { CurrentUserId } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { QuizSummaryDto } from '../quizzes/dto/quiz-response.dto';
import { QuizzesService } from '../quizzes/quizzes.service';
import { UsersService } from '../users/users.service';
import { ProfileDto } from './dto/profile-response.dto';

@ApiTags('profile')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
@UseGuards(JwtAuthGuard)
@Controller('profile')
export class ProfileController {
  constructor(
    private readonly usersService: UsersService,
    private readonly quizzesService: QuizzesService,
    private readonly attemptsService: AttemptsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Profile of the current user with activity stats' })
  @ApiOkResponse({ type: ProfileDto })
  async getProfile(@CurrentUserId() userId: string): Promise<ProfileDto> {
    const [user, quizzesCreated, attemptStats] = await Promise.all([
      this.usersService.findOne(userId),
      this.quizzesService.countByUser(userId),
      this.attemptsService.statsForUser(userId),
    ]);
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      stats: { quizzesCreated, ...attemptStats },
    };
  }

  @Get('quizzes')
  @ApiOperation({ summary: 'Quizzes created by the current user' })
  @ApiOkResponse({ type: [QuizSummaryDto] })
  getCreatedQuizzes(@CurrentUserId() userId: string) {
    return this.quizzesService.findAll(userId);
  }

  @Get('attempts')
  @ApiOperation({ summary: 'History of quizzes the current user has taken, newest first' })
  @ApiOkResponse({ type: [AttemptSummaryDto] })
  getAttempts(@CurrentUserId() userId: string) {
    return this.attemptsService.findAllForUser(userId);
  }

  @Get('attempts/:id')
  @ApiOperation({ summary: 'One of your attempts with per-question results' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiOkResponse({ type: AttemptDetailDto })
  @ApiNotFoundResponse({ description: 'Attempt not found' })
  getAttempt(@Param('id', ParseIntPipe) id: number, @CurrentUserId() userId: string) {
    return this.attemptsService.findOneForUser(id, userId);
  }
}
