import { IsEmail, IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum LoginType {
  PASSWORD = 'password',
  OTP = 'otp',
}

/**
 * Request DTO for user login.
 * Validates email and authentication credentials.
 */
export class LoginRequestDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password', enum: LoginType, required: false })
  @IsEnum(LoginType)
  @IsOptional()
  type?: LoginType;

  @ApiProperty({ example: 'SecurePass123!', required: false })
  @IsString()
  @IsOptional()
  password?: string;

  @ApiProperty({ example: '123456', required: false })
  @IsString()
  @IsOptional()
  otp?: string;
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
