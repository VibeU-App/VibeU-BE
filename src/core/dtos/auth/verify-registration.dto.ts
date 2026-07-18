import { IsEmail, IsString, Length, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Request DTO for verifying registration with OTP.
 * The user receives an OTP after registration and submits it here.
 */
export class VerifyRegistrationRequestDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
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

/**
 * Envelope wrapper DTO for successful registration verification response.
 */
export class VerifyRegistrationResponseEnvelopeDto {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'Email verified successfully. You can now join the app.' })
  message: string;

  @ApiProperty({ type: VerifyRegistrationResponseDto })
  data: VerifyRegistrationResponseDto;

  @ApiProperty({ nullable: true, example: null })
  metadata: any;
}
