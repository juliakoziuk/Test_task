import { ApiProperty } from '@nestjs/swagger';

export class ProfileStatsDto {
  @ApiProperty({ example: 2 })
  quizzesCreated: number;

  @ApiProperty({ example: 5 })
  attemptsCount: number;

  @ApiProperty({
    example: 72.5,
    nullable: true,
    type: Number,
    description: 'Average score in percent; null without attempts',
  })
  averagePercent: number | null;
}

export class ProfileDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Jane Doe' })
  name: string;

  @ApiProperty({ example: 'jane@example.com' })
  email: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ type: ProfileStatsDto })
  stats: ProfileStatsDto;
}
