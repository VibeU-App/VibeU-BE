import { MatchEntity } from '../entities/match.entity';

export interface IMatchRepository {
  createMatch(user1Id: string, user2Id: string): Promise<MatchEntity>;

  findById(matchId: string): Promise<MatchEntity | null>;

  findMatchBetween(userA: string, userB: string): Promise<MatchEntity | null>;

  findAllByUserId(userId: string): Promise<MatchEntity[]>;

  deleteMatch(matchId: string): Promise<boolean>;
}
