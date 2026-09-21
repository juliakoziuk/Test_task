import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDefined,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { AnswerValue, QuestionType } from '../models/question.model';

export class CreateQuestionDto {
  @ApiProperty({ example: 'Which of these are primitive types?' })
  @IsString()
  @IsNotEmpty()
  text: string;

  @ApiProperty({ enum: QuestionType, example: QuestionType.CHECKBOX })
  @IsEnum(QuestionType)
  type: QuestionType;

  @ApiPropertyOptional({
    type: [String],
    example: ['string', 'object', 'number'],
    description: 'Required (min 2) for checkbox questions, ignored otherwise.',
  })
  @ValidateIf((q: CreateQuestionDto) => q.type === QuestionType.CHECKBOX)
  @IsArray()
  @ArrayMinSize(2, { message: 'checkbox questions need at least 2 options' })
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  options?: string[];

  @ApiProperty({
    oneOf: [{ type: 'boolean' }, { type: 'string' }, { type: 'array', items: { type: 'string' } }],
    example: ['string', 'number'],
    description:
      'boolean for boolean questions, string for input questions, list of correct options for checkbox questions. Never returned by the API.',
  })
  @IsDefined()
  correctAnswer: AnswerValue;
}

export class CreateQuizDto {
  @ApiProperty({ example: 'JavaScript Basics' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ type: [CreateQuestionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  questions: CreateQuestionDto[] = [];
}
