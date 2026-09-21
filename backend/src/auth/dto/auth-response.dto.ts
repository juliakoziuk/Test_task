import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../users/dto/user-response.dto';

export class AuthResponseDto {
  @ApiProperty({ description: 'Short-lived JWT to send as `Authorization: Bearer <token>`' })
  accessToken: string;

  @ApiProperty({
    description: 'Long-lived token for `POST /auth/refresh`; rotated on every refresh',
  })
  refreshToken: string;

  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;
}
