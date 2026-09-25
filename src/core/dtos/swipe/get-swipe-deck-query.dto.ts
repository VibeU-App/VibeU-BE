import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsString } from 'class-validator';
import { CandidateCardEntity } from 'src/core/entities/candidate-card.entity';

export class GetSwipeDeckQueryDto {
  @ApiProperty({ example: 15 })
  @IsNumber()
  limit: number;
}

export class GetSwipeDeckResponseDto {
  @ApiProperty({
    type: [CandidateCardEntity],
    description: 'Array of valid candidates',
  })
  @IsArray()
  candidateDeck: CandidateCardEntity[];
}
