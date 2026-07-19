import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsEduEmail } from '../../decorators/is-edu-email.decorator';

/**
 * Request DTO for forgot password.
 * The user submits their email to receive a password reset OTP.
 */
export class ForgotPasswordRequestDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsEduEmail()
  email: string;
}
