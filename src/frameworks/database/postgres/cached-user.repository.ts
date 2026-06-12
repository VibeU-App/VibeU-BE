import { Injectable } from '@nestjs/common';
import { IUserRepository } from '../../../use-cases/auth/user-repository.interface';
import { UserEntity } from '../../../core/entities/user.entity';
import { PrismaService } from '../prisma/prisma.service';
import { userCache } from '../prisma/prisma-cache.extension';

/**
 * Cached Prisma implementation of the user repository.
 *
 * This repository adds caching on top of Prisma queries to reduce
 * database load for frequently accessed data.
 *
 * Caching strategy:
 * - findById and findByEmail results are cached
 * - Cache is invalidated on save and update operations
 * - Cache entries expire after 5 minutes (configurable)
 * - Soft-deleted users are excluded from cache
 */
@Injectable()
export class CachedUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Finds a user by email with caching.
   * Excludes soft-deleted users.
   */
  async findByEmail(email: string): Promise<UserEntity | null> {
    const cacheKey = `user:email:${email.toLowerCase()}`;

    // Check cache first
    const cached = userCache.get<UserEntity>(cacheKey);
    if (cached) {
      return cached;
    }

    // Query database
    const user = await this.prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        deletedAt: null,
      },
    });

    if (!user) {
      // Cache null result briefly to prevent repeated queries for non-existent users
      userCache.set(cacheKey, null, 60); // 1 minute TTL for null results
      return null;
    }

    const entity = this.mapToEntity(user);

    // Cache the result
    userCache.set(cacheKey, entity);

    return entity;
  }

  /**
   * Finds a user by ID with caching.
   * Excludes soft-deleted users.
   */
  async findById(id: string): Promise<UserEntity | null> {
    const cacheKey = `user:id:${id}`;

    // Check cache first
    const cached = userCache.get<UserEntity>(cacheKey);
    if (cached) {
      return cached;
    }

    // Query database
    const user = await this.prisma.user.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!user) {
      userCache.set(cacheKey, null, 60);
      return null;
    }

    const entity = this.mapToEntity(user);

    // Cache the result
    userCache.set(cacheKey, entity);

    return entity;
  }

  /**
   * Saves a new user and invalidates related cache entries.
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

    const entity = this.mapToEntity(created);

    // Invalidate cache for this email (in case of null cache)
    userCache.delete(`user:email:${user.email.toLowerCase()}`);

    return entity;
  }

  /**
   * Updates a user and invalidates all related cache entries.
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

    const entity = this.mapToEntity(updated);

    // Invalidate all cache entries for this user
    userCache.delete(`user:id:${user.id}`);
    userCache.delete(`user:email:${user.email.toLowerCase()}`);

    return entity;
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
      user.isVerified,
      user.createdAt,
      user.updatedAt,
      user.deletedAt,
    );
  }
}
