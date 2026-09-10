import { ApiProperty } from '@nestjs/swagger';

/**
 * Response DTO for get profile me.
 */
export class GetProfileMeResponseDto {
  @ApiProperty({ example: 'Alice' })
  nickname: string;

  @ApiProperty({ example: 'abc1234' })
  avatarSeed: string;

  @ApiProperty({
    nullable: true,
    example: 'Hello, I am Alice!',
  })
  bio: string | null;

  @ApiProperty({ example: 'Capricorn' })
  zodiacSign: string;

  @ApiProperty({ example: 26 })
  age: number;

  @ApiProperty({
    nullable: true,
    example: 2,
  })
  personalityArchetypeId: number | null;

  @ApiProperty({ example: 100 })
  numOfPosts: number;

  @ApiProperty({ example: 10 })
  numOfMatches: number;
}
