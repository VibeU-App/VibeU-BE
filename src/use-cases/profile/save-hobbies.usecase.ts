import { Inject, Injectable } from '@nestjs/common';
import { IProfileRepository } from '../../core/abstracts/profile-repository.interface';
import { IHobbyRepository } from '../../core/abstracts/hobby-repository.interface';

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
      throw new Error('Must select between 3 and 10 hobbies');
    }

    const profile = await this.profileRepository.findByUserId(userId);
    if (!profile) {
      throw new Error('Profile not found');
    }

    const existingHobbies = await this.hobbyRepository.findByIds(hobbyIds);
    if (existingHobbies.length !== hobbyIds.length) {
      throw new Error('One or more invalid hobby IDs');
    }

    await this.hobbyRepository.updateProfileHobbies(profile.id, hobbyIds);
  }
}
