import { Injectable } from '@nestjs/common';
import { ISessionRepository } from '../../../core/abstracts/session-repository.interface';
import { SessionEntity } from '../../../core/entities/session.entity';
import { PrismaService } from './prisma.service';

/**
 * Prisma implementation of the session repository.
 */
@Injectable()
export class PrismaSessionRepository implements ISessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Saves a new session (refresh token) to the database.
   */
  async save(session: SessionEntity): Promise<SessionEntity> {
    const created = await this.prisma.session.create({
      data: {
        userId: session.userId,
        refreshToken: session.refreshToken,
        expiresAt: session.expiresAt,
      },
    });

    return this.mapToEntity(created);
  }

  /**
   * Updates an existing session (refresh token rotation / expiry update).
   */
  async update(session: SessionEntity): Promise<SessionEntity> {
    const updated = await this.prisma.session.update({
      where: { id: session.id },
      data: {
        refreshToken: session.refreshToken,
        expiresAt: session.expiresAt,
        deletedAt: session.deletedAt,
      },
    });

    return this.mapToEntity(updated);
  }

  /**
   * Finds a session by its refresh token.
   * Returns null if not found or soft-deleted.
   */
  async findByRefreshToken(refreshToken: string): Promise<SessionEntity | null> {
    const session = await this.prisma.session.findFirst({
      where: {
        refreshToken,
        deletedAt: null,
      },
    });

    if (!session) {
      return null;
    }

    return this.mapToEntity(session);
  }

  /**
   * Finds all active sessions for a user.
   */
  async findByUserId(userId: string): Promise<SessionEntity[]> {
    const sessions = await this.prisma.session.findMany({
      where: {
        userId,
        deletedAt: null,
      },
    });

    return sessions.map((s) => this.mapToEntity(s));
  }

  /**
   * Soft-deletes all sessions for a user.
   */
  async deleteByUserId(userId: string): Promise<void> {
    await this.prisma.session.updateMany({
      where: {
        userId,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  /**
   * Maps a Prisma session record to a SessionEntity.
   */
  private mapToEntity(session: any): SessionEntity {
    return new SessionEntity(
      session.id,
      session.userId,
      session.refreshToken,
      session.expiresAt,
      session.createdAt,
      session.updatedAt,
      session.deletedAt,
    );
  }
}
