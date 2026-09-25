import { Inject, Injectable } from '@nestjs/common';
import { ISwipeRepository } from '../../core/abstracts/swipe-repository.interface';
import { SwipeEntity } from '../../core/entities/swipe.entity';
import { IProfileRepository } from '../../core/abstracts';
import { AppException, ErrorCode } from '../../core';
import { IMatchRepository } from '../../core/abstracts/match-repository.interface';

export interface CreateSwipeResult {
  swipe: SwipeEntity;
  isMatch: boolean;
}

@Injectable()
export class CreateSwipeUseCase {
  constructor(
    @Inject('ISwipeRepository')
    private readonly swipeRepository: ISwipeRepository,
    @Inject('IProfileRepository')
    private readonly profileRepository: IProfileRepository,
    @Inject('IMatchRepository')
    private readonly matchRepository: IMatchRepository,
  ) {}

  async execute(
    swiperId: string,
    targetId: string,
    isLike: boolean,
  ): Promise<CreateSwipeResult> {
    if (swiperId === targetId) {
      throw new AppException(ErrorCode.SWIPE_SELF_SWIPE);
    }

    console.log('INSIDE USE CASE');
    const duplicateSwipe = await this.swipeRepository.findBySwiperAndTarget(
      swiperId,
      targetId,
    );

    if (!!duplicateSwipe) {
      throw new AppException(ErrorCode.SWIPE_DUPLICATE);
    }

    const swiperProfile = await this.profileRepository.findByUserId(swiperId);
    const targetProfile = await this.profileRepository.findByUserId(targetId);

    if (
      swiperProfile?.gender.toLowerCase() ===
      targetProfile?.gender.toLowerCase()
    ) {
      throw new AppException(ErrorCode.SWIPE_SAME_SEX);
    }

    const newSwipe = await this.swipeRepository.create({
      swiperId: swiperId,
      targetId: targetId,
      isLike: isLike,
    });

    const reciprocalLikeSwipe = await this.swipeRepository.findReciprocalLike(
      swiperId,
      targetId,
    );

    if (!!reciprocalLikeSwipe) {
      await this.matchRepository.createMatch(swiperId, targetId);
    }

    return {
      swipe: newSwipe,
      isMatch: !!reciprocalLikeSwipe,
    };
  }
}
