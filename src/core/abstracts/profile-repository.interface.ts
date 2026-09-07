import { ProfileEntity } from '../entities/profile.entity';

export interface IProfileRepository {
  findByUserId(userId: string): Promise<ProfileEntity | null>;
  findById(id: number): Promise<ProfileEntity | null>;
  save(profile: ProfileEntity): Promise<ProfileEntity>;
  update(profile: ProfileEntity): Promise<ProfileEntity>;
  getProfilePostAndMatchCounts(
    profileId: number,
  ): Promise<{ outpostCount: number; matchlistCount: number }>;
}
