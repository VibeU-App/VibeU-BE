import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { IUserRepository } from '../../../../use-cases/auth/user-repository.interface';
import { UserEntity, UserRole } from '../../../../core/entities/user.entity';
import { User as PrismaUser, UserRole as PrismaUserRole } from '@prisma/client';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) return null;

    return this.mapToEntity(user);
  }

  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) return null;

    return this.mapToEntity(user);
  }

  async save(user: UserEntity): Promise<UserEntity> {
    const savedUser = await this.prisma.user.create({
      data: {
        email: user.email,
        passwordHash: user.passwordHash,
        accountStatusId: user.accountStatusId,
        role: this.mapToPrismaRole(user.role),
        isVerified: user.isVerified,
      },
    });

    return this.mapToEntity(savedUser);
  }

  async update(user: UserEntity): Promise<UserEntity> {
    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        email: user.email,
        passwordHash: user.passwordHash,
        accountStatusId: user.accountStatusId,
        role: this.mapToPrismaRole(user.role),
        isVerified: user.isVerified,
        deletedAt: user.deletedAt,
      },
    });

    return this.mapToEntity(updatedUser);
  }

  async findStatusByName(name: string): Promise<string | null> {
    const status = await this.prisma.accountStatus.findUnique({
      where: { name: name as PrismaUserRole === 'ADMIN' ? 'ACTIVE' : (name as any) }, // Simplification for mapping
    });
    
    // Better way to map:
    const prismaStatus = await this.prisma.accountStatus.findUnique({
      where: { name: name as any },
    });

    return prismaStatus ? prismaStatus.id : null;
  }

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
    );
  }

  private mapToPrismaRole(role: UserRole): PrismaUserRole {
    return role === UserRole.ADMIN ? PrismaUserRole.ADMIN : PrismaUserRole.USER;
  }

  private mapToDomainRole(role: PrismaUserRole): UserRole {
    return role === PrismaUserRole.ADMIN ? UserRole.ADMIN : UserRole.USER;
  }
}
