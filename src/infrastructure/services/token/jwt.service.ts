import * as jwt from 'jsonwebtoken';
import { config } from '../../../configuration';
import { IJwtService } from '../../../core/abstracts/jwt-service.interface';

export type { IJwtService };

/**
 * JWT service implementation using jsonwebtoken library.
 *
 * This service handles JWT token creation and verification. It uses the
 * secret key from configuration to sign and verify tokens.
 */
export class JwtService implements IJwtService {
  /**
   * Creates a signed JWT token from the given payload.
   * The token expires in 24 hours by default.
   * @param payload - The data to encode in the token
   * @returns The signed JWT token string
   */
  signPayload(payload: Record<string, any>): string {
    return jwt.sign(payload, config.jwt.secretKey, { expiresIn: '24h' });
  }

  /**
   * Verifies a JWT token and returns the decoded payload.
   * @param token - The JWT token string to verify
   * @returns The decoded token payload
   * @throws {jwt.JsonWebTokenError} If the token is invalid
   * @throws {jwt.TokenExpiredError} If the token has expired
   */
  verifyToken(token: string): Record<string, any> {
    return jwt.verify(token, config.jwt.secretKey) as Record<string, any>;
  }
}
