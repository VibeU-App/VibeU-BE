import { IsBoolean, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SwipeEntity } from 'src/core/entities/swipe.entity';

export class CreateSwipeRequestDto {
  @ApiProperty({ example: 'uuid2' })
  @IsString()
  targetId: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  isLike: boolean;
}

export class CreateSwipeResponseDto {
  @ApiProperty({
    example: {
      id: 'swipe-uuid',
      swiperId: 'swiper-uuid',
      targetId: 'target-uuid',
      isLike: true,
      createdAt: new Date(),
    },
  })
  swipe: SwipeEntity;

  @ApiProperty({ example: true })
  @IsBoolean()
  isMatch: boolean;
}
