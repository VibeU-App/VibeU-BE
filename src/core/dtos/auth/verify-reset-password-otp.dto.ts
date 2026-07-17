import { IsEmail, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Request DTO for verifying OTP during password reset.
 * Used in the forgot-password flow after user requests a reset code.
 */
export class VerifyResetPasswordOtpRequestDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @Length(6, 6)
  otp: string;
}

/**
 * Response DTO for successful OTP verification.
 * Returns a reset token that must be used when resetting the password.
 */
export class VerifyResetPasswordOtpResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  resetToken: string;
}

/**
 * Envelope wrapper DTO for successful OTP verification response.
 */
export class VerifyResetPasswordOtpResponseEnvelopeDto {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'OK' })
  message: string;

  @ApiProperty({ type: VerifyResetPasswordOtpResponseDto })
  data: VerifyResetPasswordOtpResponseDto;

  @ApiProperty({
    example: {
      timestamp: '2026-07-17T13:30:00.000Z'
    }
  })
  metadata: Record<string, any>;
}
