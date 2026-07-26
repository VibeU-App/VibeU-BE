import { ApiProperty } from '@nestjs/swagger';

/**
 * Response DTO for get profile me.
 */
export class GetProfileMeResponseDto {
    @ApiProperty({ example: 'Alice' })
    nickname: string;

    @ApiProperty({ example: 'abc1234' })
    avatarSeed: string;

    @ApiProperty({ example: 'Hello, I am Alice!' })
    bio: string | null;

    @ApiProperty({ example: 'Capricorn' })
    zodiacSign: string;

    @ApiProperty({ example: 26 })
    age: number;

    @ApiProperty({ example: 2 })
    personalityArchetypeId: number | null;

    @ApiProperty({ example: 100 })
    nuumOfPosts: number;

    @ApiProperty({ example: 10 })
    nuumOfMatches: number;
}