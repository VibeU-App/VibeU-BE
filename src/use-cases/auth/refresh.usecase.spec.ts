import { RefreshUsecase } from './refresh.usecase';
import { MockSessionRepository, MockUserRepository, MockTokenService } from './test-mocks';
import { SessionEntity } from '../../core/entities/session.entity';
import { UserEntity, UserRole } from '../../core/entities/user.entity';
import { ErrorCode } from '../../core/errors/error-codes';

describe('RefreshUsecase', () => {
  let usecase: RefreshUsecase;
  let mockSessionRepository: MockSessionRepository;
  let mockUserRepository: MockUserRepository;
  let mockTokenService: MockTokenService;

  beforeEach(() => {
    mockSessionRepository = new MockSessionRepository();
    mockUserRepository = new MockUserRepository();
    mockTokenService = new MockTokenService();
    usecase = new RefreshUsecase(mockSessionRepository, mockUserRepository, mockTokenService);
  });

  afterEach(() => {
    mockSessionRepository.clear();
    mockUserRepository.clear();
  });

  it('should rotate access and refresh tokens for valid active session', async () => {
    // 1. Setup user
    const user = new UserEntity(
      'user-123',
      'user@example.edu',
      'hashed-password',
      'active-status-id',
      UserRole.USER,
      true,
      new Date(),
      new Date(),
      null,
    );
    mockUserRepository.addUser(user);

    // 2. Setup active session
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 1); // Expire tomorrow
    const session = new SessionEntity(
      'session-123',
      'user-123',
      'active-refresh-token',
      expiry,
      new Date(),
      new Date(),
      null,
    );
    await mockSessionRepository.save(session);

    // 3. Execute
    const result = await usecase.execute('active-refresh-token');

    // 4. Assertions
    expect(result.accessToken).toContain('mock-access-token-user-123');
    expect(result.refreshToken).toContain('mock-refresh-token-user-123');
    expect(result.user.id).toBe('user-123');

    // Check that the old refresh token is no longer in active sessions
    const oldSession = await mockSessionRepository.findByRefreshToken('active-refresh-token');
    expect(oldSession).toBeNull();

    // Check that the new refresh token is active
    const newSession = await mockSessionRepository.findByRefreshToken(result.refreshToken);
    expect(newSession).toBeDefined();
    expect(newSession?.expiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  it('should reject rotation for non-existent session', async () => {
    await expect(usecase.execute('invalid-refresh-token')).rejects.toThrow();
  });

  it('should soft-delete session and throw AUTH_SESSION_EXPIRED if session is expired', async () => {
    // 1. Setup user
    const user = new UserEntity(
      'user-123',
      'user@example.edu',
      'hashed-password',
      'active-status-id',
      UserRole.USER,
      true,
      new Date(),
      new Date(),
      null,
    );
    mockUserRepository.addUser(user);

    // 2. Setup expired session
    const expiry = new Date();
    expiry.setDate(expiry.getDate() - 1); // Expired yesterday
    const session = new SessionEntity(
      'session-123',
      'user-123',
      'expired-refresh-token',
      expiry,
      new Date(),
      new Date(),
      null,
    );
    await mockSessionRepository.save(session);

    // 3. Execute and verify exception
    try {
      await usecase.execute('expired-refresh-token');
      fail('Should have thrown an error');
    } catch (error) {
      expect(error.code).toBe(ErrorCode.AUTH_SESSION_EXPIRED);
    }

    // Verify session is soft-deleted
    const oldSession = await mockSessionRepository.findByRefreshToken('expired-refresh-token');
    expect(oldSession).toBeNull();
  });
});
