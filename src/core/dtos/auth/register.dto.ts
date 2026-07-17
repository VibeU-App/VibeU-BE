import { IsEmail, IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Request DTO for user registration.
 * Validates email and password with strength requirements.
 */
export class RegisterRequestDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SecurePass123!' })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Password must contain uppercase, lowercase, number and special character',
  })
  password: string;
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

/**
 * Envelope wrapper DTO for successful registration response.
 */
export class RegisterResponseEnvelopeDto {
  @ApiProperty({ example: 201 })
  statusCode: number;

  @ApiProperty({ example: 'User registered successfully. Please check your email for verification code.' })
  message: string;

  @ApiProperty({ type: RegisterResponseDto })
  data: RegisterResponseDto;

  @ApiProperty({ nullable: true, example: null })
  metadata: any;
}
