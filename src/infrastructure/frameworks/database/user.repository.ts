import { Injectable } from '@nestjs/common';
import { IUserRepository } from '../../../core/abstracts/user-repository.interface';
import { UserEntity, UserRole } from '../../../core/entities/user.entity';
import { User as PrismaUser, UserRole as PrismaUserRole } from '@prisma/client';
import { PrismaService } from './prisma.service';

/**
 * Prisma implementation of the user repository.
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
   * Finds a user by their primary or recovery email address.
   * Excludes soft-deleted users.
   */
  async findByEmailOrRecoveryEmail(email: string): Promise<UserEntity | null> {
    const normalizedEmail = email.toLowerCase();
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: normalizedEmail },
          { recoveryEmail: normalizedEmail },
        ],
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
        recoveryEmail: user.recoveryEmail,
        passwordHash: user.passwordHash,
        accountStatusId: user.accountStatusId,
        role: this.mapToPrismaRole(user.role),
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
        recoveryEmail: user.recoveryEmail,
        passwordHash: user.passwordHash,
        accountStatusId: user.accountStatusId,
        role: this.mapToPrismaRole(user.role),
        isVerified: user.isVerified,
        deletedAt: user.deletedAt,
      },
    });

    return this.mapToEntity(updated);
  }

  /**
   * Finds an account status ID by its name.
   */
  async findStatusByName(name: string): Promise<number | null> {
    const prismaStatus = await this.prisma.accountStatus.findFirst({
      where: { name: name as any },
    });

    return prismaStatus ? prismaStatus.id : null;
  }

  /**
   * Maps a Prisma user record to a UserEntity.
   */
  private mapToEntity(prismaUser: PrismaUser): UserEntity {
    return new UserEntity(
      prismaUser.id,
      prismaUser.email,
      prismaUser.passwordHash,
      prismaUser.accountStatusId,
      this.mapToDomainRole(prismaUser.role),
      prismaUser.isVerified,
      prismaUser.createdAt,
      prismaUser.updatedAt,
      prismaUser.deletedAt,
      prismaUser.recoveryEmail,
    );
  }

  private mapToPrismaRole(role: UserRole): PrismaUserRole {
    if (role === UserRole.ADMIN) return PrismaUserRole.ADMIN;
    if (role === UserRole.MODERATOR) return PrismaUserRole.MODERATOR;
    return PrismaUserRole.USER;
  }

  private mapToDomainRole(role: PrismaUserRole): UserRole {
    if (role === PrismaUserRole.ADMIN) return UserRole.ADMIN;
    if (role === PrismaUserRole.MODERATOR) return UserRole.MODERATOR;
    return UserRole.USER;
  }
}
