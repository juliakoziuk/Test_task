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

  @ApiProperty({ example: '3f2b8c1e-5a7d-4e2b-9c41-8d6f0a1b2c3d' })
  userId: string;

  @ApiProperty({ example: 'JavaScript Basics' })
  title: string;

  @ApiProperty({ example: 3 })
  questionCount: number;
}

export class QuizDetailDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '3f2b8c1e-5a7d-4e2b-9c41-8d6f0a1b2c3d' })
  userId: string;

  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;

  @ApiProperty({ example: 'JavaScript Basics' })
  title: string;

  @ApiProperty({ type: [QuestionResponseDto] })
  questions: QuestionResponseDto[];
}

export class QuestionEditDto extends QuestionResponseDto {
  @ApiProperty({
    oneOf: [{ type: 'boolean' }, { type: 'string' }, { type: 'array', items: { type: 'string' } }],
    nullable: true,
    description: 'Null for legacy questions created before grading existed',
  })
  correctAnswer: boolean | string | string[] | null;
}

export class QuizEditDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '3f2b8c1e-5a7d-4e2b-9c41-8d6f0a1b2c3d' })
  userId: string;

  @ApiProperty({ example: 'JavaScript Basics' })
  title: string;

  @ApiProperty({ type: [QuestionEditDto] })
  questions: QuestionEditDto[];
}
