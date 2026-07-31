import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  Length,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SaveBasicProfileDto {
  @ApiProperty({
    example: 'Alex',
    description: 'User nickname (2-30 characters)',
  })
  @IsString()
  @IsNotEmpty()
  @Length(2, 30)
  nickname!: string;

  @ApiProperty({ example: 'MALE', description: 'Gender of the user' })
  @IsString()
  @IsNotEmpty()
  gender!: string;

  @ApiProperty({
    example: 'dicebear-seed-123',
    description: 'Avatar seed for the user',
  })
  @IsString()
  @IsNotEmpty()
  avatarSeed!: string;

  @ApiProperty({
    example: '2006-01-15T00:00:00.000Z',
    description: 'Birthday in ISO format',
  })
  @IsDateString()
  @IsNotEmpty()
  birthday!: string;

  @ApiPropertyOptional({
    example: 'Hanoi University',
    description: 'University name',
  })
  @IsString()
  @IsOptional()
  university?: string;
}
