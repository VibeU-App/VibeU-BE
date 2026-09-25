import { IsNotEmpty, IsUUID } from 'class-validator';

export class MatchParamDto {
  @IsUUID()
  @IsNotEmpty()
  matchId: string;
}
