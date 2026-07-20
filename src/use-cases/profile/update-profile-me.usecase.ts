import { Inject, Injectable } from '@nestjs/common';
import { IProfileRepository } from '../../core/abstracts/profile-repository.interface';
import { ProfileEntity } from '../../core/entities/profile.entity';

@Injectable()
export class UpdateProfileMeUseCase {
  constructor(
    @Inject('IProfileRepository')
    private readonly profileRepository: IProfileRepository,
  ) {}

  async execute(
    userId: string,
    payload: {
      fullName?: string;
      birthday?: Date;
      bio?: string | null;
      avatarSeed?: string;
      university?: string | null;
    },
  ): Promise<ProfileEntity> {
    throw new Error('Method not implemented.');
  }
}
