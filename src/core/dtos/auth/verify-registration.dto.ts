import { IsEmail, IsString, Length, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsEduEmail } from '../../decorators/is-edu-email.decorator';

/**
 * Request DTO for verifying registration with OTP.
 * The user receives an OTP after registration and submits it here.
 */
export class VerifyRegistrationRequestDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsEduEmail()
  email: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @Length(6, 6)
  otp: string;
}

/**
 * Response DTO for successful registration verification.
 */
export class VerifyRegistrationResponseDto {
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
