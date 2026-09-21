import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../users/dto/user-response.dto';
import { QuestionType } from '../models/question.model';

export class QuestionResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  quizId: number;

  @ApiProperty({ example: 'Which of these are primitive types?' })
  text: string;

  @ApiProperty({ enum: QuestionType })
  type: QuestionType;

  @ApiProperty({ type: [String], example: ['string', 'object'] })
  options: string[];

  @ApiProperty({ example: 0, description: 'Order of the question within the quiz' })
  position: number;
}

export class QuizSummaryDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  userId: number;

  @ApiProperty({ example: 'JavaScript Basics' })
  title: string;

  @ApiProperty({ example: 3 })
  questionCount: number;
}

export class QuizDetailDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  userId: number;

  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;

  @ApiProperty({ example: 'JavaScript Basics' })
  title: string;

  @ApiProperty({ type: [QuestionResponseDto] })
  questions: QuestionResponseDto[];
}
