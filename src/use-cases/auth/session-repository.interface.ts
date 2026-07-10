import { SessionEntity } from '../../core/entities/session.entity';

/**
 * Interface for session repository.
 * 
 * Defines the contract for session (refresh token) data access.
 */
export interface ISessionRepository {
  save(session: SessionEntity): Promise<SessionEntity>;
  findByRefreshToken(refreshToken: string): Promise<SessionEntity | null>;
  findByUserId(userId: string): Promise<SessionEntity[]>;
  deleteByUserId(userId: string): Promise<void>;
}
