import { AuthService } from './auth.service';
import { MockUserRepository } from './mock-user-repository';
import { UserEntity, UserRole } from '../../core/entities/user.entity';

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

      // Pre-existing user
      const existingUser = UserEntity.create({
        email,
        passwordHash: 'hashed-password',
      });
      mockRepository.addUser(existingUser);

      await expect(authService.register(email, password)).rejects.toThrow(
        'Email already registered',
      );
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

      // Pre-existing user with hashed password (assuming bcrypt hash)
      const existingUser = UserEntity.create({
        email,
        passwordHash: '$2b$10$validhash', // This will need to match during implementation
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

      await expect(authService.login(email, password)).rejects.toThrow(
        'Invalid credentials',
      );
    });

    it('should reject login with wrong password', async () => {
      const email = 'user@example.com';
      const correctPassword = 'SecurePass123!';
      const wrongPassword = 'WrongPass456!';

      // Pre-existing user
      const existingUser = UserEntity.create({
        email,
        passwordHash: '$2b$10$validhash',
      });
      mockRepository.addUser(existingUser);

      await expect(authService.login(email, wrongPassword)).rejects.toThrow(
        'Invalid credentials',
      );
    });
  });

  describe('validateToken', () => {
    it('should return user data with valid token', async () => {
      const userId = 'user-123';
      const email = 'user@example.com';

      // Pre-existing user
      const existingUser = new UserEntity(
        userId,
        email,
        'hashed-password',
        UserRole.USER,
        new Date(),
        new Date(),
      );
      mockRepository.addUser(existingUser);

      // This test will fail until JWT generation is implemented
      // We'll need to generate a valid token first
      const result = await authService.validateToken('valid-token');

      expect(result).toBeDefined();
      expect(result.id).toBe(userId);
      expect(result.email).toBe(email);
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('should reject invalid token', async () => {
      await expect(authService.validateToken('invalid-token')).rejects.toThrow(
        'Invalid token',
      );
    });

    it('should reject expired token', async () => {
      await expect(authService.validateToken('expired-token')).rejects.toThrow(
        'Token expired',
      );
    });
  });
});