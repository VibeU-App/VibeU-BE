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
  sub: string; // User ID
  email: string; // User email
  role: string; // User role
}

/**
 * Interface for token service.
 * Handles creation and verification of access tokens and refresh tokens.
 */
export interface ITokenService {
  createTokenPair(userId: string, email: string, role: string): TokenPair;
  verifyAccessToken(token: string): AccessTokenPayload;
  generateRefreshToken(): string;
}
