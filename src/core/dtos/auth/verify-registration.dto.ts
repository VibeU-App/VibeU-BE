import { IsEmail, IsString, Length } from 'class-validator';
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
  @ApiProperty({ example: 'Email verified successfully. You can now log in.' })
  message: string;
}
