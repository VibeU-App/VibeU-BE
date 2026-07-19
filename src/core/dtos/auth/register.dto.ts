import { IsEmail, IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsEduEmail } from '../../decorators/is-edu-email.decorator';

/**
 * Request DTO for user registration.
 * Validates email and password with strength requirements.
 */
export class RegisterRequestDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsEduEmail()
  email: string;
}

/**
 * Response DTO for successful registration.
 * Returns the created user info (without sensitive data).
 */
export class RegisterResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;

  @ApiProperty({ example: 'opaque-refresh-token-string' })
  refreshToken: string;

  @ApiProperty({
    example: {
      id: 'uuid-string',
      email: 'user@example.com',
      isVerified: false,
    },
  })
  user: {
    id: string;
    email: string;
    isVerified: boolean;
  };
}
