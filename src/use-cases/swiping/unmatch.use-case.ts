import { Inject, Injectable } from '@nestjs/common';
import { ISwipeRepository } from '../../core/abstracts/swipe-repository.interface';
import { SwipeEntity } from '../../core/entities/swipe.entity';
import { IProfileRepository, IUserRepository } from 'src/core/abstracts';
import { AppException, ErrorCode } from 'src/core';
import { IMatchRepository } from 'src/core/abstracts/match-repository.interface';

export interface UnmatchResult {
  result: boolean;
  message: string;
}

@Injectable()
export class UnmatchUseCase {
  constructor(
    @Inject('IMatchRepository')
    private readonly matchRepository: IMatchRepository,
  ) {}

  async execute(matchId: string): Promise<UnmatchResult> {
    const result = await this.matchRepository.deleteMatch(matchId);

    return {
      result: result,
      message: result
        ? 'You have successfully unmatched this person'
        : 'Error unmatching. Try again later',
    };
  }
}
