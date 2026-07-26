import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, ArrayMinSize, IsString } from 'class-validator';

/**
 * Request DTO for update profile tags.
 * Information on new tags for updating.
 */
export class UpdateProfileTagsRequestDto {
    @ApiProperty({ example: 'user123' })
    @IsString()
    userId: string;

    @ApiProperty({ example: [1, 2, 3] })
    @ArrayMinSize(3)
    @ArrayMaxSize(10)
    hobbyIds: number[];
}
