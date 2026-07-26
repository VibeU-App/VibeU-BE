import { Inject, Injectable } from '@nestjs/common';
import { IProfileRepository } from '../../core/abstracts/profile-repository.interface';
import { ProfileEntity } from '../../core/entities/profile.entity';

@Injectable()
export class SaveBasicProfileUseCase {
  constructor(
    @Inject('IProfileRepository')
    private readonly profileRepository: IProfileRepository,
  ) {}

  async execute(
    userId: string,
    payload: {
      nickname: string;
      gender: string;
      avatarSeed: string;
      birthday: Date;
      university?: string | null;
    },
  ): Promise<ProfileEntity> {
    throw new Error('Method not implemented.');
  }
}
