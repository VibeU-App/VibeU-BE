import { Inject, Injectable } from '@nestjs/common';
import { IProfileRepository, IHobbyRepository } from '../../core/abstracts';
import { AppException, ErrorCode } from '../../core/errors';

@Injectable()
export class UpdateProfileTagsUseCase {
  constructor(
    @Inject('IProfileRepository')
    private readonly profileRepository: IProfileRepository,
    @Inject('IHobbyRepository')
    private readonly hobbyRepository: IHobbyRepository,
  ) {}

  async execute(userId: string, hobbyIds: number[]): Promise<void> {
    const userProfile = await this.profileRepository.findByUserId(userId);

    if (userProfile) {
      await this.hobbyRepository.updateProfileHobbies(userProfile.id, hobbyIds);
    } else {
      throw new AppException(ErrorCode.PROFILE_USER_NOT_FOUND);
    }
  }
}
