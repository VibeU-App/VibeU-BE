import { Inject, Injectable } from '@nestjs/common';
import { IMatchRepository } from 'src/core/abstracts/match-repository.interface';
import { MatchEntity } from 'src/core/entities/match.entity';

@Injectable()
export class GetMatchesUseCase {
  constructor(
    @Inject('IMatchRepository')
    private readonly matchRepository: IMatchRepository,
  ) {}

  async execute(userId: string): Promise<MatchEntity[]> {
    const matches = await this.matchRepository.findAllByUserId(userId);
    return matches;
  }
}
