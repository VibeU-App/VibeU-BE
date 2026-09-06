import { ApiProperty } from '@nestjs/swagger';

export class ProfileRequestDto {}

export class HobbyResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  category!: string;
}

export class ArchetypeResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  description!: string;
}

export class ProfileStatsDto {
  @ApiProperty()
  outpostCount!: number;

  @ApiProperty()
  matchlistCount!: number;
}

export class ProfileResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty()
  nickname!: string;

  @ApiProperty()
  gender!: string;

  @ApiProperty()
  avatarSeed!: string;

  @ApiProperty()
  birthday!: string;

  @ApiProperty()
  age!: number;

  @ApiProperty()
  zodiac!: string;

  @ApiProperty({ required: false })
  university?: string;

  @ApiProperty({ required: false })
  bio?: string;

  @ApiProperty()
  isCompleted!: boolean;

  @ApiProperty({ type: [HobbyResponseDto] })
  hobbies!: HobbyResponseDto[];

  @ApiProperty({ type: ArchetypeResponseDto, required: false })
  personalityArchetype?: ArchetypeResponseDto;

  @ApiProperty({ type: ProfileStatsDto })
  stats!: ProfileStatsDto;
}
