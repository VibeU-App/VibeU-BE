import { UserEntity } from '../../core/entities/user.entity';

/**
 * Interface for user repository.
 * 
 * Defines the contract for user data access. Implementations can be
 * Prisma-based, raw SQL, or in-memory mocks for testing.
 */
export interface IUserRepository {
  findByEmail(email: string): Promise<UserEntity | null>;
  findById(id: string): Promise<UserEntity | null>;
  save(user: UserEntity): Promise<UserEntity>;
  update(user: UserEntity): Promise<UserEntity>;
  findStatusByName(name: string): Promise<string | null>;
}
