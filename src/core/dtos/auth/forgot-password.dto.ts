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
