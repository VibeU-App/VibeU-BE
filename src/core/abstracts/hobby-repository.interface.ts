import { HobbyEntity } from '../entities/hobby.entity';

export interface IHobbyRepository {
  findAll(): Promise<HobbyEntity[]>;
  findByIds(ids: number[]): Promise<HobbyEntity[]>;
  findProfileHobbies(profileId: number): Promise<HobbyEntity[]>;
  updateProfileHobbies(profileId: number, hobbyIds: number[]): Promise<void>;
}
