import { Inject, Injectable } from '@nestjs/common';
import { IProfileRepository, IHobbyRepository } from '../../core/abstracts';
import { AppException, ErrorCode } from '../../core/errors';

@Injectable()
export class SaveHobbiesUseCase {
  constructor(
    @Inject('IProfileRepository')
    private readonly profileRepository: IProfileRepository,
    @Inject('IHobbyRepository')
    private readonly hobbyRepository: IHobbyRepository,
  ) {}

  async execute(userId: string, hobbyIds: number[]): Promise<void> {
    if (hobbyIds.length < 3 || hobbyIds.length > 10) {
      throw new AppException(
        ErrorCode.VALIDATION_FAILED,
        400,
        'Must select between 3 and 10 hobbies',
      );
    }

    const profile = await this.profileRepository.findByUserId(userId);
    if (!profile) {
      throw new AppException(ErrorCode.PROFILE_USER_NOT_FOUND);
    }

    const existingHobbies = await this.hobbyRepository.findByIds(hobbyIds);
    if (existingHobbies.length !== hobbyIds.length) {
      throw new AppException(
        ErrorCode.VALIDATION_FAILED,
        400,
        'One or more invalid hobby IDs',
      );
    }

    await this.hobbyRepository.updateProfileHobbies(profile.id, hobbyIds);
  }
}
