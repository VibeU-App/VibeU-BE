import { Inject, Injectable } from '@nestjs/common';
import { ISwipeRepository } from '../../core/abstracts/swipe-repository.interface';
import { IProfileRepository } from '../../core/abstracts';
import { AppException, ErrorCode } from '../../core';
import { CandidateCardEntity } from '../../core/entities/candidate-card.entity';

@Injectable()
export class GetSwipeDeckUseCase {
  constructor(
    @Inject('ISwipeRepository')
    private readonly swipeRepository: ISwipeRepository,
    @Inject('IProfileRepository')
    private readonly profileRepository: IProfileRepository,
  ) {}

  async execute(userId: string): Promise<CandidateCardEntity[]> {
    const userProfile = await this.profileRepository.findByUserId(userId);

    if (!!userProfile) {
      const oppositeSex = userProfile.gender === 'MALE' ? 'FEMALE' : 'MALE';
      const deckCard = await this.swipeRepository.findDeckCandidates(
        userId,
        oppositeSex,
        15,
      );

      return deckCard;
    } else {
      throw new AppException(ErrorCode.SWIPE_USER_NOT_FOUND);
    }
  }
}
