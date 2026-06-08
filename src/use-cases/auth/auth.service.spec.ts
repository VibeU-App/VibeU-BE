import { AuthService } from './auth.service';
import { MockUserRepository } from './mock-user-repository';
import { UserEntity, UserRole } from '../../core/entities/user.entity';
import { ErrorCode } from '../../core/errors';

describe('AuthService', () => {
  let authService: AuthService;
  let mockRepository: MockUserRepository;

  beforeEach(() => {
    mockRepository = new MockUserRepository();
    authService = new AuthService(mockRepository);
  });

  afterEach(() => {
    mockRepository.clear();
  });

  describe('register', () => {
    it('should register a new user with valid email and password', async () => {
      const email = 'test@example.com';
      const password = 'SecurePass123!';

      const result = await authService.register(email, password);

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(email.toLowerCase());
      expect(result.user.role).toBe(UserRole.USER);
      expect(result.user).not.toHaveProperty('passwordHash');
    });

    it('should reject registration with duplicate email', async () => {
      const email = 'existing@example.com';
      const password = 'SecurePass123!';

      const existingUser = UserEntity.create({
        email,
        passwordHash: 'hashed-password',
      });
      mockRepository.addUser(existingUser);

      try {
        await authService.register(email, password);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.code).toBe(ErrorCode.AUTH_EMAIL_ALREADY_EXISTS);
      }
    });

    it('should normalize email to lowercase', async () => {
      const email = 'Test@Example.COM';
      const password = 'SecurePass123!';

      const result = await authService.register(email, password);

      expect(result.user.email).toBe('test@example.com');
    });
  });

  describe('login', () => {
    it('should return access token and user data with valid credentials', async () => {
      const email = 'user@example.com';
      const password = 'SecurePass123!';

      const existingUser = UserEntity.create({
        email,
        passwordHash: '$2b$10$validhash',
      });
      mockRepository.addUser(existingUser);

      const result = await authService.login(email, password);

      expect(result.accessToken).toBeDefined();
      expect(typeof result.accessToken).toBe('string');
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(email);
      expect(result.user).not.toHaveProperty('passwordHash');
    });

    it('should reject login with non-existent email', async () => {
      const email = 'nonexistent@example.com';
      const password = 'SecurePass123!';

      try {
        await authService.login(email, password);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.code).toBe(ErrorCode.AUTH_INVALID_CREDENTIALS);
      }
    });

    it('should reject login with wrong password', async () => {
      const email = 'user@example.com';
      const wrongPassword = 'WrongPass456!';

      const existingUser = UserEntity.create({
        email,
        passwordHash: '$2b$10$validhash',
      });
      mockRepository.addUser(existingUser);

      try {
        await authService.login(email, wrongPassword);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.code).toBe(ErrorCode.AUTH_INVALID_CREDENTIALS);
      }
    });
  });

  describe('forgotPassword', () => {
    it('should send OTP for existing user', async () => {
      const email = 'user@example.com';

      const existingUser = UserEntity.create({
        email,
        passwordHash: 'hashed-password',
      });
      mockRepository.addUser(existingUser);

      const result = await authService.forgotPassword(email);

      expect(result.message).toBeDefined();
    });

    it('should reject if user not found', async () => {
      const email = 'nonexistent@example.com';

      try {
        await authService.forgotPassword(email);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.code).toBe(ErrorCode.AUTH_USER_NOT_FOUND);
      }
    });
  });

  describe('verifyOtp', () => {
    it('should return reset token with valid OTP', async () => {
      const email = 'user@example.com';
      const otp = '123456';

      const existingUser = UserEntity.create({
        email,
        passwordHash: 'hashed-password',
      });
      mockRepository.addUser(existingUser);

      const result = await authService.verifyOtp(email, otp);

      expect(result.resetToken).toBeDefined();
    });

    it('should reject if user not found', async () => {
      const email = 'nonexistent@example.com';
      const otp = '123456';

      try {
        await authService.verifyOtp(email, otp);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.code).toBe(ErrorCode.AUTH_USER_NOT_FOUND);
      }
    });

    it('should reject invalid OTP', async () => {
      const email = 'user@example.com';
      const invalidOtp = '000000';

      const existingUser = UserEntity.create({
        email,
        passwordHash: 'hashed-password',
      });
      mockRepository.addUser(existingUser);

      try {
        await authService.verifyOtp(email, invalidOtp);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.code).toBe(ErrorCode.AUTH_OTP_INVALID);
      }
    });

    it('should reject expired OTP', async () => {
      const email = 'user@example.com';
      const expiredOtp = '999999';

      const existingUser = UserEntity.create({
        email,
        passwordHash: 'hashed-password',
      });
      mockRepository.addUser(existingUser);

      try {
        await authService.verifyOtp(email, expiredOtp);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.code).toBe(ErrorCode.AUTH_OTP_EXPIRED);
      }
    });
  });

  describe('validateToken', () => {
    it('should return user data with valid token', async () => {
      const userId = 'user-123';
      const email = 'user@example.com';

      const existingUser = new UserEntity(
        userId,
        email,
        'hashed-password',
        UserRole.USER,
        new Date(),
        new Date(),
      );
      mockRepository.addUser(existingUser);

      const result = await authService.validateToken('valid-token');

      expect(result).toBeDefined();
      expect(result.id).toBe(userId);
      expect(result.email).toBe(email);
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('should reject invalid token', async () => {
      try {
        await authService.validateToken('invalid-token');
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.code).toBe(ErrorCode.AUTH_INVALID_TOKEN);
      }
    });

    it('should reject expired token', async () => {
      try {
        await authService.validateToken('expired-token');
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.code).toBe(ErrorCode.AUTH_TOKEN_EXPIRED);
      }
    });
  });
});