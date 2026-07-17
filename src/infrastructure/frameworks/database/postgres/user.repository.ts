import { Injectable } from '@nestjs/common';
import { IUserRepository } from '../../../../use-cases/auth/user-repository.interface';
import { UserEntity } from '../../../../core/entities/user.entity';
import { AccountStatusName } from '../../../../core/entities/user.entity';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Prisma implementation of the user repository.
 *
 * This is the concrete repository that the use-cases will use in production.
 * It implements the IUserRepository interface defined in the use-cases layer,
 * following the Dependency Inversion Principle.
 *
 * Prisma provides:
 * - Type-safe database queries
 * - Automatic query building
 * - Connection pooling
 * - Migration management
 */
@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Finds a user by their email address.
   * Excludes soft-deleted users.
   */
  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        deletedAt: null,
      },
    });

    if (!user) {
      return null;
    }

    return this.mapToEntity(user);
  }

  /**
   * Finds a user by their ID.
   * Excludes soft-deleted users.
   */
  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!user) {
      return null;
    }

    return this.mapToEntity(user);
  }

  /**
   * Saves a new user to the database.
   */
  async save(user: UserEntity): Promise<UserEntity> {
    const created = await this.prisma.user.create({
      data: {
        email: user.email,
        passwordHash: user.passwordHash,
        accountStatusId: user.accountStatusId,
        isVerified: user.isVerified,
      },
    });

    return this.mapToEntity(created);
  }

  /**
   * Updates an existing user in the database.
   */
  async update(user: UserEntity): Promise<UserEntity> {
    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        email: user.email,
        passwordHash: user.passwordHash,
        accountStatusId: user.accountStatusId,
        isVerified: user.isVerified,
        deletedAt: user.deletedAt,
      },
    });

    return this.mapToEntity(updated);
  }

  /**
   * Maps a Prisma user record to a UserEntity.
   */
  private mapToEntity(user: any): UserEntity {
    return new UserEntity(
      user.id,
      user.email,
      user.passwordHash,
      user.accountStatusId,
      user.role,
      user.isVerified,
      user.createdAt,
      user.updatedAt,
      user.deletedAt,
    );
  }

  /**
   * Finds an account status ID by its name.
   */
  async findStatusByName(name: string): Promise<string | null> {
    const status = await this.prisma.accountStatus.findFirst({
      where: { name: name as AccountStatusName },
    });
    return status?.id ?? null;
  }
}
