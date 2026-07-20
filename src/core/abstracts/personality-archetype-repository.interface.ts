import { PersonalityArchetypeEntity } from '../entities/personality-archetype.entity';

export interface IPersonalityArchetypeRepository {
  findAll(): Promise<PersonalityArchetypeEntity[]>;
  findById(id: string): Promise<PersonalityArchetypeEntity | null>;
}
