import { IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Request DTO for resetting password.
 * The user must have a valid reset token from the verify-otp step.
 */
export class ResetPasswordRequestDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  @IsString()
  resetToken: string;

  @ApiProperty({ example: 'NewSecurePass456!' })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Password must contain uppercase, lowercase, number and special character',
  })
  newPassword: string;
}

/**
 * Response DTO for successful password reset.
 */
export class ResetPasswordResponseDto {
  @ApiProperty({ example: 'Password reset successfully. You can now log in with your new password.' })
  message: string;
}

/**
 * Envelope wrapper DTO for successful password reset response.
 */
export class ResetPasswordResponseEnvelopeDto {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'OK' })
  message: string;

  @ApiProperty({ type: ResetPasswordResponseDto })
  data: ResetPasswordResponseDto;

  @ApiProperty({
    example: {
      timestamp: '2026-07-17T13:30:00.000Z'
    }
  })
  metadata: Record<string, any>;
}
