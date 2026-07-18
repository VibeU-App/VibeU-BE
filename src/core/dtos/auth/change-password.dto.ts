import { IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Envelope } from '../../envelope/envelope.interface';

export class ChangePasswordDto {
  @ApiProperty({ example: 'SecurePass123!' })
  @IsString()
  oldPassword: string;

  @ApiProperty({ example: 'NewSecurePass123!' })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Password must contain uppercase, lowercase, number and special character',
  })
  newPassword: string;
}

export class ChangePasswordResponseDto {
  @ApiProperty({ example: 'Password changed successfully.' })
  message: string;
}

export class ChangePasswordResponseEnvelopeDto implements Envelope<ChangePasswordResponseDto> {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'Password changed successfully.' })
  message: string;

  @ApiProperty({ type: ChangePasswordResponseDto })
  data: ChangePasswordResponseDto;

  @ApiProperty({ example: null, nullable: true })
  metadata: any;
}
