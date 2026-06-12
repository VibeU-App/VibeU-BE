import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { config } from '../../configuration';

/**
 * Token types returned by the token service.
 */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * Decoded access token payload.
 */
export interface AccessTokenPayload {
  sub: string;    // User ID
  email: string;  // User email
  role: string;   // User role
}

/**
 * Interface for token service.
 *
 * Handles creation and verification of both:
 * - Access tokens (JWT) - short-lived, contains user info
 * - Refresh tokens (opaque) - long-lived, used to get new access tokens
 */
export interface ITokenService {
  createTokenPair(userId: string, email: string, role: string): TokenPair;
  verifyAccessToken(token: string): AccessTokenPayload;
  generateRefreshToken(): string;
}

/**
 * Token service implementation.
 *
 * Access tokens:
 * - JWT format (header.payload.signature)
 * - Contains user ID, email, role
 * - Short-lived (15 minutes) for security
 * - Can be verified without database lookup
 *
 * Refresh tokens:
 * - Opaque random string (64 bytes hex = 128 chars)
 * - No user info embedded - just a random identifier
 * - Long-lived (7 days)
 * - Must be stored in database to validate
 * - Used to issue new access tokens when they expire
 *
 * Why this design:
 * - Access tokens are stateless - no DB hit on every request
 * - Refresh tokens are stateful - allows revocation (logout, password change)
 * - If access token is stolen, it expires quickly
 * - If refresh token is stolen, user can detect and revoke
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
   * Token expires in 15 minutes for security.
   */
  private createAccessToken(userId: string, email: string, role: string): string {
    const payload: AccessTokenPayload = {
      sub: userId,
      email,
      role,
    };

    return jwt.sign(payload, config.jwt.secretKey, {
      expiresIn: '15m', // Short-lived for security
    });
  }

  /**
   * Generates a cryptographically secure opaque refresh token.
   * Uses 64 random bytes converted to hex = 128 character string.
   *
   * Why crypto.randomBytes:
   * - Math.random() is predictable and not secure
   * - crypto.randomBytes uses OS entropy source
   * - Suitable for security-sensitive tokens
   */
  generateRefreshToken(): string {
    return crypto.randomBytes(64).toString('hex');
  }

  /**
   * Verifies an access token and returns the decoded payload.
   * @throws {jwt.JsonWebTokenError} If token is invalid
   * @throws {jwt.TokenExpiredError} If token has expired
   */
  verifyAccessToken(token: string): AccessTokenPayload {
    return jwt.verify(token, config.jwt.secretKey) as AccessTokenPayload;
  }
}
