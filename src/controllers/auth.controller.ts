import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RegisterRequestDto, RegisterResponseEnvelopeDto } from '../core/dtos/auth/register.dto';
import { VerifyRegistrationRequestDto, VerifyRegistrationResponseEnvelopeDto, VerifyRegistrationResponseDto } from '../core/dtos/auth/verify-registration.dto';
import { LoginRequestDto, LoginResponseEnvelopeDto, LoginResponseDto } from '../core/dtos/auth/login.dto';
import { ForgotPasswordRequestDto, ForgotPasswordResponseEnvelopeDto, ForgotPasswordResponseDto } from '../core/dtos/auth/forgot-password.dto';
import { VerifyResetPasswordOtpRequestDto, VerifyResetPasswordOtpResponseEnvelopeDto, VerifyResetPasswordOtpResponseDto } from '../core/dtos/auth/verify-reset-password-otp.dto';
import { ResetPasswordRequestDto, ResetPasswordResponseEnvelopeDto, ResetPasswordResponseDto } from '../core/dtos/auth/reset-password.dto';
import { RefreshRequestDto, RefreshResponseEnvelopeDto, RefreshResponseDto } from '../core/dtos/auth/refresh.dto';
import { CreatePasswordDto, CreatePasswordResponseEnvelopeDto, CreatePasswordResponseDto } from '../core/dtos/auth/create-password.dto';
import { ChangePasswordDto, ChangePasswordResponseEnvelopeDto, ChangePasswordResponseDto } from '../core/dtos/auth/change-password.dto';
import { Envelope } from '../core/envelope/envelope.interface';
import { RegisterUsecase } from '../use-cases/auth/register.usecase';
import { VerifyRegistrationUsecase } from '../use-cases/auth/verify-registration.usecase';
import { LoginUsecase } from '../use-cases/auth/login.usecase';
import { ForgotPasswordUsecase } from '../use-cases/auth/forgot-password.usecase';
import { VerifyResetPasswordOtpUsecase } from '../use-cases/auth/verify-reset-password-otp.usecase';
import { ResetPasswordUsecase } from '../use-cases/auth/reset-password.usecase';
import { RefreshUsecase } from '../use-cases/auth/refresh.usecase';
import { CreatePasswordUsecase } from '../use-cases/auth/create-password.usecase';
import { ChangePasswordUsecase } from '../use-cases/auth/change-password.usecase';
import { JwtAuthGuard } from '../middleware/jwt-auth.guard';
import { RolesGuard } from '../middleware/roles.guard';
import { Roles } from '../middleware/roles.decorator';
import { UserRole } from '../core/entities/user.entity';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUsecase: RegisterUsecase,
    private readonly verifyRegistrationUsecase: VerifyRegistrationUsecase,
    private readonly loginUsecase: LoginUsecase,
    private readonly forgotPasswordUsecase: ForgotPasswordUsecase,
    private readonly verifyResetPasswordOtpUsecase: VerifyResetPasswordOtpUsecase,
    private readonly resetPasswordUsecase: ResetPasswordUsecase,
    private readonly refreshUsecase: RefreshUsecase,
    private readonly createPasswordUsecase: CreatePasswordUsecase,
    private readonly changePasswordUsecase: ChangePasswordUsecase,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, type: RegisterResponseEnvelopeDto, description: 'User registered successfully' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async register(@Body() dto: RegisterRequestDto): Promise<Envelope<null>> {
    await this.registerUsecase.execute(dto.email);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'User registered successfully. Please check your email for verification code.',
      data: null,
      metadata: null,
    };
  }

  @Post('verify-registration')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify registration OTP' })
  @ApiResponse({ status: 200, type: VerifyRegistrationResponseEnvelopeDto, description: 'Email verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP' })
  async verifyRegistration(@Body() dto: VerifyRegistrationRequestDto): Promise<Envelope<VerifyRegistrationResponseDto>> {
    const result = await this.verifyRegistrationUsecase.execute(dto.email, dto.otp);
    return {
      statusCode: HttpStatus.OK,
      message: 'Email verified successfully. You are now logged in.',
      data: result,
      metadata: null,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, type: LoginResponseEnvelopeDto, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() dto: LoginRequestDto): Promise<Envelope<LoginResponseDto>> {
    const result = await this.loginUsecase.execute(dto.email, dto.password);
    return {
      statusCode: HttpStatus.OK,
      message: 'Login successful',
      data: result,
      metadata: null,
    };
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset OTP' })
  @ApiResponse({ status: 200, type: ForgotPasswordResponseEnvelopeDto, description: 'Reset code sent if email exists' })
  async forgotPassword(@Body() dto: ForgotPasswordRequestDto): Promise<Envelope<null>> {
    const result = await this.forgotPasswordUsecase.execute(dto.email);

    return {
      statusCode: 200,
      message: result.message,
      data: null,
      metadata: {
        timestamp: new Date().toISOString()
      },
    }
  }

  @Post('verify-reset-password-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify reset OTP and get reset token' })
  @ApiResponse({ status: 200, type: VerifyResetPasswordOtpResponseEnvelopeDto, description: 'Reset token generated' })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP' })
  async verifyResetOtp(@Body() dto: VerifyResetPasswordOtpRequestDto): Promise<Envelope<VerifyResetPasswordOtpResponseDto>> {
    const result = await this.verifyResetPasswordOtpUsecase.execute(dto.email, dto.otp);
    
    return {
      statusCode: 200,
      message: "OK",
      data: {
        resetToken: result.resetToken
      },
      metadata: {
        timestamp: new Date().toISOString()
      },
    }
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with reset token' })
  @ApiResponse({ status: 200, type: ResetPasswordResponseEnvelopeDto, description: 'Password reset successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired reset token' })
  async resetPassword(@Body() dto: ResetPasswordRequestDto): Promise<Envelope<null>> {
    const result = await this.resetPasswordUsecase.execute(dto.newPassword, dto.resetToken);
    
    return {
      statusCode: 200,
      message: result.message,
      data: null,
      metadata: {
        timestamp: new Date().toISOString()
      },
    }
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate access and refresh tokens' })
  @ApiResponse({ status: 200, type: RefreshResponseEnvelopeDto, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  async refresh(@Body() dto: RefreshRequestDto): Promise<Envelope<RefreshResponseDto>> {
    const result = await this.refreshUsecase.execute(dto.refreshToken);

    return {
      statusCode: HttpStatus.OK,
      message: 'Token refreshed successfully',
      data: result,
      metadata: null,
    };
  }

  @Post('create-password')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.USER, UserRole.MODERATOR)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create user password for the first time' })
  @ApiResponse({ status: 200, type: CreatePasswordResponseEnvelopeDto, description: 'Password created successfully' })
  @ApiResponse({ status: 400, description: 'Password already set or invalid input' })
  async createPassword(@Req() req: any, @Body() dto: CreatePasswordDto): Promise<Envelope<CreatePasswordResponseDto>> {
    const result = await this.createPasswordUsecase.execute(req.user.sub, dto.password);
    return {
      statusCode: HttpStatus.OK,
      message: result.message,
      data: result,
      metadata: null,
    };
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.USER, UserRole.MODERATOR)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change existing password' })
  @ApiResponse({ status: 200, type: ChangePasswordResponseEnvelopeDto, description: 'Password changed successfully' })
  @ApiResponse({ status: 400, description: 'Incorrect old password or invalid input' })
  async changePassword(@Req() req: any, @Body() dto: ChangePasswordDto): Promise<Envelope<ChangePasswordResponseDto>> {
    const result = await this.changePasswordUsecase.execute(req.user.sub, dto.oldPassword, dto.newPassword);
    return {
      statusCode: HttpStatus.OK,
      message: result.message,
      data: result,
      metadata: null,
    };
  }
}
