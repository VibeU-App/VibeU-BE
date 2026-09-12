import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO representing an individual hobby/interest tag.
 */
export class ProfileTagDto {
  @ApiProperty({ example: 1, description: 'Unique tag ID' })
  id: number;

  @ApiProperty({ example: 'Soccer', description: 'Name of the tag' })
  name: string;

  @ApiProperty({
    example: 'SPORT',
    description: 'Category of the tag (e.g. PERSONALITY, SPORT, FOOD)',
  })
  category: string;
}

/**
 * Response DTO for fetching user's tag list.
 */
export class GetProfileTagsResponseDto {
  @ApiProperty({
    type: [ProfileTagDto],
    description: "List of the user's selected tags",
  })
  tags: ProfileTagDto[];
}
