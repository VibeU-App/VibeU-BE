import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Request DTO for refresh token rotation.
 */
export class RefreshRequestDto {
  @ApiProperty({ example: 'opaque-refresh-token-string' })
  @IsString()
  refreshToken: string;
}

/**
 * Response DTO for successful refresh token rotation.
 */
export class RefreshResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;

  @ApiProperty({ example: 'new-opaque-refresh-token-string' })
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
 * Envelope wrapper DTO for successful token refresh response.
 */
export class RefreshResponseEnvelopeDto {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'Token refreshed successfully' })
  message: string;

  @ApiProperty({ type: RefreshResponseDto })
  data: RefreshResponseDto;

  @ApiProperty({ nullable: true, example: null })
  metadata: any;
}
