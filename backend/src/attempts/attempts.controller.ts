import { Body, Controller, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUserId } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AttemptsService } from './attempts.service';
import { AttemptDetailDto } from './dto/attempt-response.dto';
import { SubmitAttemptDto } from './dto/submit-attempt.dto';

@ApiTags('attempts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('quizzes/:quizId/attempts')
export class AttemptsController {
  constructor(private readonly attemptsService: AttemptsService) {}

  @Post()
  @ApiOperation({ summary: 'Submit answers to a quiz; returns the graded attempt' })
  @ApiCreatedResponse({ type: AttemptDetailDto })
  @ApiBadRequestResponse({
    description: 'Unknown question, duplicate answer or wrong answer format',
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiNotFoundResponse({ description: 'Quiz not found' })
  submit(
    @Param('quizId', ParseIntPipe) quizId: number,
    @CurrentUserId() userId: number,
    @Body() dto: SubmitAttemptDto,
  ) {
    return this.attemptsService.submit(quizId, userId, dto);
  }
}
