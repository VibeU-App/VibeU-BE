import { IsArray, ArrayMinSize, ArrayMaxSize, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SaveHobbiesRequestDto {
  @ApiProperty({ example: [1, 2, 3], description: 'Array of hobby IDs' })
  @IsArray()
  @ArrayMinSize(3)
  @ArrayMaxSize(10)
  @IsInt({ each: true })
  tagIds!: number[];
}

export class SaveHobbiesResponseDto {
  @ApiProperty({ example: 5 })
  savedCount!: number;
}
