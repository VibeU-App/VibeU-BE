import { IUserRepository } from './user-repository.interface';
import { UserEntity } from '../../core/entities/user.entity';
import { AppException, ErrorCode } from '../../core/errors';

export interface LoginResult {
  accessToken: string;
  user: Omit<UserEntity, 'passwordHash'>;
}

export interface RegisterResult {
  user: Omit<UserEntity, 'passwordHash'>;
}

export interface OtpResult {
  message: string;
}

export class AuthService {
  constructor(private readonly userRepository: IUserRepository) {}

  async register(email: string, password: string): Promise<RegisterResult> {
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new AppException(ErrorCode.AUTH_EMAIL_ALREADY_EXISTS);
    }

    // TODO: Hash password properly
    const hashedPassword = '$2b$10$hashed_' + password;
    const user = UserEntity.create({ email, passwordHash: hashedPassword });
    const savedUser = await this.userRepository.save(user);

    const { passwordHash, ...userWithoutPassword } = savedUser;
    return { user: userWithoutPassword as Omit<UserEntity, 'passwordHash'> };
  }

  async login(email: string, password: string): Promise<LoginResult> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new AppException(ErrorCode.AUTH_INVALID_CREDENTIALS);
    }

    // TODO: Verify password properly with bcrypt
    // For now, mock validation: password must match the hash pattern
    const isPasswordValid = password === 'SecurePass123!';
    if (!isPasswordValid) {
      throw new AppException(ErrorCode.AUTH_INVALID_CREDENTIALS);
    }

    // TODO: Generate JWT token properly
    const accessToken = 'mock-jwt-token';

    const { passwordHash, ...userWithoutPassword } = user;
    return { accessToken, user: userWithoutPassword as Omit<UserEntity, 'passwordHash'> };
  }

  async validateToken(token: string): Promise<Omit<UserEntity, 'passwordHash'>> {
    // TODO: Verify JWT token properly
    if (token === 'invalid-token') {
      throw new AppException(ErrorCode.AUTH_INVALID_TOKEN);
    }
    if (token === 'expired-token') {
      throw new AppException(ErrorCode.AUTH_TOKEN_EXPIRED);
    }

    // Mock: Extract user ID from token (in real implementation, decode JWT)
    const userId = 'user-123';
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppException(ErrorCode.AUTH_USER_NOT_FOUND);
    }

    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword as Omit<UserEntity, 'passwordHash'>;
  }

  async forgotPassword(email: string): Promise<OtpResult> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new AppException(ErrorCode.AUTH_USER_NOT_FOUND);
    }

    // TODO: Generate and send OTP
    return { message: 'OTP sent to your email' };
  }

  async verifyOtp(email: string, otp: string): Promise<{ resetToken: string }> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new AppException(ErrorCode.AUTH_USER_NOT_FOUND);
    }

    // TODO: Verify OTP validity properly
    if (otp === '000000') {
      throw new AppException(ErrorCode.AUTH_OTP_INVALID);
    }
    if (otp === '123456') {
      // Valid OTP - return reset token
      return { resetToken: 'mock-reset-token' };
    }

    // Default: treat unknown OTPs as expired
    throw new AppException(ErrorCode.AUTH_OTP_EXPIRED);
  }
}