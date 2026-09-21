import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class ListQuizzesQueryDto {
  @ApiPropertyOptional({
    example: '3f2b8c1e-5a7d-4e2b-9c41-8d6f0a1b2c3d',
    description: 'Only return quizzes owned by this user',
  })
  @IsOptional()
  @IsUUID()
  userId?: string;
}
