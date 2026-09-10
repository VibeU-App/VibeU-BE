import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { config } from '../../../configuration';
import {
  ITokenService,
  TokenPair,
  AccessTokenPayload,
} from '../../../core/abstracts/token-service.interface';

export type { ITokenService, TokenPair, AccessTokenPayload };

/**
 * Token service implementation.
 *
 * Access tokens:
 * - JWT format (header.payload.signature)
 * - Contains user ID, email, role
 * - Short-lived (configurable, default 1 hour)
 * - Can be verified without database lookup
 *
 * Refresh tokens:
 * - Opaque random string (64 bytes hex = 128 chars)
 * - No user info embedded - just a random identifier
 * - Long-lived (configurable, default 7 days)
 * - Must be stored in database to validate
 * - Used to issue new access tokens when they expire
 */
export class TokenService implements ITokenService {
  /**
   * Creates both an access token and refresh token.
   * @param userId - The user's ID
   * @param email - The user's email
   * @param role - The user's role
   * @returns TokenPair containing both tokens
   */
  createTokenPair(userId: string, email: string, role: string): TokenPair {
    return {
      accessToken: this.createAccessToken(userId, email, role),
      refreshToken: this.generateRefreshToken(),
    };
  }

  /**
   * Creates a JWT access token.
   * Token TTL is loaded from config (default: 1 hour).
   */
  private createAccessToken(
    userId: string,
    email: string,
    role: string,
  ): string {
    const payload: AccessTokenPayload = {
      sub: userId,
      email,
      role,
    };

    const ttlSeconds = config.jwt.accessTokenTtl;
    return jwt.sign(payload, config.jwt.secretKey, { expiresIn: ttlSeconds });
  }

  /**
   * Generates a cryptographically secure opaque refresh token.
   */
  generateRefreshToken(): string {
    return crypto.randomBytes(64).toString('hex');
  }

  /**
   * Verifies an access token and returns the decoded payload.
   */
  verifyAccessToken(token: string): AccessTokenPayload {
    return jwt.verify(token, config.jwt.secretKey) as AccessTokenPayload;
  }
}
