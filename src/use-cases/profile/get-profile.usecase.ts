import { Inject, Injectable } from '@nestjs/common';
import { IProfileRepository } from '../../core/abstracts/profile-repository.interface';

@Injectable()
export class GetProfileUseCase {
  constructor(
    @Inject('IProfileRepository')
    private readonly profileRepository: IProfileRepository,
  ) {}

  async execute(userId: string): Promise<any> {
    throw new Error('Method not implemented.');
  }
}
