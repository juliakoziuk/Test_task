import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsDefined, IsInt, ValidateNested } from 'class-validator';
import { AnswerValue } from '../../quizzes/models/question.model';

export class AnswerItemDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  questionId: number;

  @ApiProperty({
    oneOf: [{ type: 'boolean' }, { type: 'string' }, { type: 'array', items: { type: 'string' } }],
    example: true,
    description: 'boolean, string or list of chosen options, matching the question type',
  })
  @IsDefined()
  answer: AnswerValue;
}

export class SubmitAttemptDto {
  @ApiProperty({ type: [AnswerItemDto], description: 'Unanswered questions count as wrong' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerItemDto)
  answers: AnswerItemDto[];
}
