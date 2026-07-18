import { SessionEntity } from '../entities/session.entity';

/**
 * Interface for Session Repository.
 */
export interface ISessionRepository {
  save(session: SessionEntity): Promise<SessionEntity>;
  update(session: SessionEntity): Promise<SessionEntity>;
  findByRefreshToken(refreshToken: string): Promise<SessionEntity | null>;
  findByUserId(userId: string): Promise<SessionEntity[]>;
  deleteByUserId(userId: string): Promise<void>;
}
