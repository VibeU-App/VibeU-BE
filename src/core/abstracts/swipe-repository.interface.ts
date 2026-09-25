import { SwipeEntity } from '../entities/swipe.entity';
import { CandidateCardEntity } from '../entities/candidate-card.entity';

export interface ISwipeRepository {
  create(swipe: {
    swiperId: string;
    targetId: string;
    isLike: boolean;
  }): Promise<SwipeEntity>;

  findBySwiperAndTarget(
    swiperId: string,
    targetId: string,
  ): Promise<SwipeEntity | null>;

  findReciprocalLike(
    swiperId: string,
    targetId: string,
  ): Promise<SwipeEntity | null>;

  findDeckCandidates(
    viewerUserId: string,
    oppositeGender: string,
    limit: number,
  ): Promise<CandidateCardEntity[]>;
}
