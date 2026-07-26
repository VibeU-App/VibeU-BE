import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { IProfileRepository } from '../../core/abstracts/profile-repository.interface';
import { IHobbyRepository } from '../../core/abstracts/hobby-repository.interface';
import { ErrorCode } from '../../core';

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

    if (!!userProfile) {
      await this.hobbyRepository.updateProfileHobbies(userProfile.id, hobbyIds);
    } else {
      throw new BadRequestException({
        code: ErrorCode.PROFILE_USER_NOT_FOUND,
        message: "User not found",
      });
    }
  }
}
