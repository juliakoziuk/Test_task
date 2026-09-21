import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';
import { QuestionType } from '../../quizzes/models/question.model';

const ANSWER_SCHEMA: ApiPropertyOptions = {
  oneOf: [{ type: 'boolean' }, { type: 'string' }, { type: 'array', items: { type: 'string' } }],
  nullable: true,
};

export class AttemptAnswerDto {
  @ApiProperty({ example: 1 })
  questionId: number;

  @ApiProperty({ example: 'Which of these are primitive types?' })
  text: string;

  @ApiProperty({ enum: QuestionType })
  type: QuestionType;

  @ApiProperty({ ...ANSWER_SCHEMA, description: 'What the user answered (null if skipped)' })
  answer: unknown;

  @ApiProperty({ ...ANSWER_SCHEMA })
  correctAnswer: unknown;

  @ApiProperty({ type: Boolean, nullable: true, description: 'Null when the question is not scored' })
  isCorrect: boolean | null;
}

export class AttemptSummaryDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  quizId: number;

  @ApiProperty({ example: 'JavaScript Basics' })
  quizTitle: string;

  @ApiProperty({ example: 2 })
  score: number;

  @ApiProperty({ example: 3, description: 'Number of scored questions' })
  total: number;

  @ApiProperty()
  createdAt: Date;
}

export class AttemptDetailDto extends AttemptSummaryDto {
  @ApiProperty({ type: [AttemptAnswerDto] })
  answers: AttemptAnswerDto[];
}
