import { IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Envelope } from '../../envelope/envelope.interface';

export class CreatePasswordDto {
  @ApiProperty({ example: 'SecurePass123!' })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Password must contain uppercase, lowercase, number and special character',
  })
  password: string;
}

export class CreatePasswordResponseDto {
  @ApiProperty({ example: 'Password created successfully.' })
  message: string;
}

export class CreatePasswordResponseEnvelopeDto implements Envelope<CreatePasswordResponseDto> {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'Password created successfully.' })
  message: string;

  @ApiProperty({ type: CreatePasswordResponseDto })
  data: CreatePasswordResponseDto;

  @ApiProperty({ example: null, nullable: true })
  metadata: any;
}
