import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

export class ListQuizzesQueryDto {
  @ApiPropertyOptional({ example: 1, description: 'Only return quizzes owned by this user' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  userId?: number;
}
