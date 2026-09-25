import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';
import { MatchEntity } from 'src/core/entities/match.entity';

export class GetMatchesResponseDto {
  @ApiProperty({
    type: [MatchEntity],
    description: 'Array of matches',
  })
  @IsArray()
  matches: MatchEntity[];
}
