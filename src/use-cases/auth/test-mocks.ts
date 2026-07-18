import { ICryptoService } from '../../infrastructure/services/crypto/crypto.interface';
import { IJwtService } from '../../infrastructure/services/token/jwt.service';
import { ITokenService, TokenPair, AccessTokenPayload } from '../../infrastructure/services/token/token.service';
import { IMailService } from '../../infrastructure/services/mail/mail.interface';
import { IPolicyRepository } from '../../core/abstracts/policy-repository.interface';
import { IUserRepository } from '../../core/abstracts/user-repository.interface';
import { IOtpRepository } from '../../core/abstracts/otp-repository.interface';
import { ISessionRepository } from '../../core/abstracts/session-repository.interface';
import { UserEntity, AccountStatusEntity, AccountStatusName } from '../../core/entities/user.entity';
import { OtpEntity } from '../../core/entities/otp.entity';
import { SessionEntity } from '../../core/entities/session.entity';

/**
 * Test mock implementations for use-case unit tests.
 *
 * These mocks provide simple in-memory implementations that allow
 * tests to run without external dependencies (database, email server, etc.).
 * Each mock has helper methods (addXxx, clear) to set up test scenarios.
 */

// Mock crypto service that simulates password hashing without actual argon2
export class MockCryptoService implements ICryptoService {
  async hash(password: string): Promise<string> {
    return '$argon2id$mock$hashed_' + password;
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return hash === '$argon2id$mock$hashed_' + password;
  }
}

// Mock JWT service that simulates token creation/verification
export class MockJwtService implements IJwtService {
  signPayload(payload: Record<string, any>): string {
    return 'mock-jwt-token';
  }

  verifyToken(token: string): Record<string, any> {
    if (token === 'invalid-token') {
      throw new Error('Invalid token');
    }
    if (token === 'expired-token') {
      throw new Error('Token expired');
    }
    return { sub: 'user-123', email: 'user@example.edu', role: 'user' };
  }
}

// Mock token service that simulates token pair creation
export class MockTokenService implements ITokenService {
  createTokenPair(userId: string, email: string, role: string): TokenPair {
    return {
      accessToken: `mock-access-token-${userId}`,
      refreshToken: `mock-refresh-token-${userId}-${Date.now()}`,
    };
  }

  verifyAccessToken(token: string): AccessTokenPayload {
    if (token === 'invalid-token') {
      throw new Error('Invalid token');
    }
    if (token === 'expired-token') {
      throw new Error('Token expired');
    }
    return { sub: 'user-123', email: 'user@example.edu', role: 'user' };
  }

  generateRefreshToken(): string {
    return `mock-refresh-token-${Date.now()}`;
  }
}

// Mock email service that records sent emails for verification
export class MockMailService implements IMailService {
  public sentEmails: Array<{ email: string; subject: string; content: string }> = [];

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return false;
    }
    const domain = email.split('@')[1];
    return domain.toLowerCase().includes('.edu');
  }

  getTargetEmail(email: string): string | null {
    if (this.isValidEmail(email)) {
      const emailParts = email.split("@");
      const identifier = emailParts[0];
      const domains = emailParts[1];
      let targetEmail = email;

      if (identifier.includes("+")) {
        targetEmail = targetEmail.split("+")[0] + "@" + domains;
      }

      if (identifier.includes(".") && domains.split(".")[0] == "gmail") {
        targetEmail = targetEmail.split("@")[0].replaceAll(".", "") + "@" + domains;
      }

      return targetEmail.toLowerCase();
    } else {
      return null;
    }
  }

  async send(to: string, subject: string, content: string): Promise<void> {
    const targetEmail : string | null = this.getTargetEmail(to);
    
    if (targetEmail === null) {
      throw new Error(`Cannot send email: recipient address '${to}' does not contain '.edu' in the domain.`);
    }
    this.sentEmails.push({ email: targetEmail, subject, content });
  }

  clear(): void {
    this.sentEmails = [];
  }
}

// Mock user repository with in-memory storage
export class MockUserRepository implements IUserRepository {
  private users: Map<string, UserEntity> = new Map();

  async findByEmail(email: string): Promise<UserEntity | null> {
    const normalizedEmail = email.toLowerCase();
    for (const user of this.users.values()) {
      if (user.email === normalizedEmail && user.deletedAt === null) {
        return user;
      }
    }
    return null;
  }

  async findById(id: string): Promise<UserEntity | null> {
    const user = this.users.get(id);
    return user && user.deletedAt === null ? user : null;
  }

  async save(user: UserEntity): Promise<UserEntity> {
    const savedUser = new UserEntity(
      `mock-${Date.now()}`,
      user.email,
      user.passwordHash,
      user.accountStatusId,
      user.role,
      user.isVerified,
      user.createdAt,
      user.updatedAt,
      user.deletedAt,
    );
    this.users.set(savedUser.id, savedUser);
    return savedUser;
  }

  async update(user: UserEntity): Promise<UserEntity> {
    this.users.set(user.id, user);
    return user;
  }

  async findStatusByName(name: string): Promise<string | null> {
    if (name === AccountStatusName.ACTIVE) return 'mock-active-status-id';
    if (name === AccountStatusName.PENDING) return 'mock-pending-status-id';
    return null;
  }

  addUser(user: UserEntity): void {
    this.users.set(user.id, user);
  }

  clear(): void {
    this.users.clear();
  }
}

// Mock OTP repository with in-memory storage and attempt tracking
export class MockOtpRepository implements IOtpRepository {
  private otps: Map<string, OtpEntity> = new Map();

  async save(otp: OtpEntity): Promise<OtpEntity> {
    this.otps.set(`${otp.userId}:optCode`, otp);
    return otp;
  }

  async findByUserId(userId: string): Promise<OtpEntity | null> {
    const otp = this.otps.get(`${userId}:optCode`);
    if (!otp) {
      return null;
    }
    return otp;
  }

  async deleteByUserId(userId: string): Promise<void> {
    for (const key of this.otps.keys()) {
      if (key.startsWith(`${userId}:`)) {
        this.otps.delete(key);
      }
    }
  }

  async incrementAttempts(userId: string): Promise<boolean> {
    const otp = this.otps.get(`${userId}:optCode`);
    if (!otp) {
      return false;
    }
    return otp.incrementAttempts();
  }

  addOtp(otp: OtpEntity): void {
    this.otps.set(`${otp.userId}:optCode`, otp);
  }

  clear(): void {
    this.otps.clear();
  }
}

// Mock session repository with in-memory storage
export class MockSessionRepository implements ISessionRepository {
  private sessions: Map<string, SessionEntity> = new Map();

  async save(session: SessionEntity): Promise<SessionEntity> {
    const savedSession = new SessionEntity(
      `mock-session-${Date.now()}`,
      session.userId,
      session.refreshToken,
      session.expiresAt,
      session.createdAt,
      session.updatedAt,
      session.deletedAt,
    );
    this.sessions.set(savedSession.refreshToken, savedSession);
    return savedSession;
  }

  async update(session: SessionEntity): Promise<SessionEntity> {
    for (const [key, value] of this.sessions.entries()) {
      if (value.id === session.id) {
        this.sessions.delete(key);
        break;
      }
    }
    this.sessions.set(session.refreshToken, session);
    return session;
  }

  async findByRefreshToken(refreshToken: string): Promise<SessionEntity | null> {
    const session = this.sessions.get(refreshToken);
    return session && session.deletedAt === null ? session : null;
  }

  async findByUserId(userId: string): Promise<SessionEntity[]> {
    const result: SessionEntity[] = [];
    for (const session of this.sessions.values()) {
      if (session.userId === userId && session.deletedAt === null) {
        result.push(session);
      }
    }
    return result;
  }

  async deleteByUserId(userId: string): Promise<void> {
    for (const [key, session] of this.sessions.entries()) {
      if (session.userId === userId) {
        this.sessions.delete(key);
      }
    }
  }

  clear(): void {
    this.sessions.clear();
  }
}

export class MockPolicyRepository implements IPolicyRepository {
  private policies: Map<string, string> = new Map([
    ['MAX_OTP_ATTEMPTS', '5'],
  ]);

  async findValueByKey(key: string): Promise<string | null> {
    return this.policies.get(key) ?? null;
  }

  setPolicy(key: string, value: string): void {
    this.policies.set(key, value);
  }

  clear(): void {
    this.policies.clear();
    this.policies.set('MAX_OTP_ATTEMPTS', '5');
  }
}
