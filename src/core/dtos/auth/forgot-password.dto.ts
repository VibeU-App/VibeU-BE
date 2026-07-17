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

/**
 * Envelope wrapper DTO for successful forgot password response.
 */
export class ForgotPasswordResponseEnvelopeDto {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'OK' })
  message: string;

  @ApiProperty({ type: ForgotPasswordResponseDto })
  data: ForgotPasswordResponseDto;

  @ApiProperty({
    example: {
      timestamp: '2026-07-17T13:30:00.000Z'
    }
  })
  metadata: Record<string, any>;
}
