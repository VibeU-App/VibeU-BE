import { Inject, Injectable } from '@nestjs/common';
import { IProfileRepository } from '../../core/abstracts/profile-repository.interface';
import { IHobbyRepository } from '../../core/abstracts/hobby-repository.interface';

@Injectable()
export class UpdateProfileTagsUseCase {
  constructor(
    @Inject('IProfileRepository')
    private readonly profileRepository: IProfileRepository,
    @Inject('IHobbyRepository')
    private readonly hobbyRepository: IHobbyRepository,
  ) {}

  async execute(userId: string, hobbyIds: number[]): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
