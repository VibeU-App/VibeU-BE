import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Request DTO for forgot password.
 * The user submits their email to receive a password reset OTP.
 */
export class ForgotPasswordRequestDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;
}

/**
 * Response DTO for forgot password.
 * Always returns success to prevent email enumeration attacks.
 */
export class ForgotPasswordResponseDto {
  @ApiProperty({ example: 'If an account exists with this email, you will receive a password reset code.' })
  message: string;
}
