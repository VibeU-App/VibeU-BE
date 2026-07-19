import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Request DTO for user login.
 * Validates the email and password fields.
 */
export class LoginRequestDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SecurePass123!' })
  @IsString()
  password: string;
}

/**
 * Response DTO for successful login.
 * Returns the access token and basic user info.
 */
export class LoginResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;

  @ApiProperty({ example: 'opaque-refresh-token-string' })
  refreshToken: string;

  @ApiProperty({
    example: {
      id: 'uuid-string',
      email: 'user@example.com',
      isVerified: true,
    },
  })
  user: {
    id: string;
    email: string;
    isVerified: boolean;
  };
}
