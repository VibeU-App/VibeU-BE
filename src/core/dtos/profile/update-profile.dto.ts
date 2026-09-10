import {
  IsOptional,
  MaxDate,
  MaxLength,
  MinDate,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ProfileEntity } from '../../../core/entities';
import { Type } from 'class-transformer';

/**
 * Request DTO for update profile me.
 * Information of the new profile for updating.
 */
export class UpdateProfileRequestDto {
  @ApiProperty({ example: 'Alice' })
  @MinLength(2)
  @MaxLength(30)
  @IsOptional()
  nickname?: string;

  @ApiProperty({ example: new Date('2000-01-01') })
  @Type(() => Date)
  @MaxDate(new Date())
  @MinDate(new Date('1906-01-01'))
  @IsOptional()
  birthday?: Date;

  @ApiProperty({ example: 'Hello, I am Alice!' })
  @MaxLength(150)
  @IsOptional()
  bio?: string;

  @ApiProperty({ example: 'abc1234' })
  @MaxLength(300)
  @IsOptional()
  avatarSeed?: string;

  @ApiProperty({ example: 'Stanford University' })
  @MaxLength(120)
  @IsOptional()
  university?: string;
}

export class UpdateProfileResponseDto {
  @ApiProperty({
    example: {
      id: 123,
      userId: 'user123',
      nickname: 'Alice',
      gender: 'Female',
      avatarSeed: 'abc1234',
      birthday: new Date('2000-01-01'),
      university: 'Stanford University',
      bio: 'Hello, I am Alice',
      personalityArchetypeId: 2,
    },
  })
  profile: ProfileEntity;
}
