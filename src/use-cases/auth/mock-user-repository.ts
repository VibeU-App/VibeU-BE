import { IUserRepository } from './user-repository.interface';
import { UserEntity } from '../../core/entities/user.entity';

export class MockUserRepository implements IUserRepository {
  private users: Map<string, UserEntity> = new Map();

  async findByEmail(email: string): Promise<UserEntity | null> {
    const normalizedEmail = email.toLowerCase();
    for (const user of this.users.values()) {
      if (user.email === normalizedEmail) {
        return user;
      }
    }
    return null;
  }

  async findById(id: string): Promise<UserEntity | null> {
    return this.users.get(id) ?? null;
  }

  async save(user: UserEntity): Promise<UserEntity> {
    const savedUser = { ...user, id: `mock-${Date.now()}` } as UserEntity;
    this.users.set(savedUser.id, savedUser);
    return savedUser;
  }

  async update(user: UserEntity): Promise<UserEntity> {
    this.users.set(user.id, user);
    return user;
  }

  // Test helper methods
  addUser(user: UserEntity): void {
    this.users.set(user.id, user);
  }

  clear(): void {
    this.users.clear();
  }
}