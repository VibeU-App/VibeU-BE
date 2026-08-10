import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  RegisterRequestDto,
  VerifyRegistrationRequestDto,
  VerifyRegistrationResponseDto,
  LoginRequestDto,
  LoginResponseDto,
  ForgotPasswordRequestDto,
  VerifyResetPasswordOtpRequestDto,
  VerifyResetPasswordOtpResponseDto,
  ResetPasswordRequestDto,
  RefreshRequestDto,
  RefreshResponseDto,
  CreatePasswordDto,
  ChangePasswordDto,
} from 'src/core/dtos';
import { Envelope } from '../core/envelope/envelope.interface';
import {
  ApiOkResponseEnvelope,
  ApiOkResponseEnvelopeNull,
  ApiCreatedResponseEnvelopeNull,
} from '../core/envelope/envelope.decorator';
import {
  RegisterUsecase,
  VerifyRegistrationUsecase,
  LoginUsecase,
  RequestLoginOtpUsecase,
  ForgotPasswordUsecase,
  VerifyResetPasswordOtpUsecase,
  ResetPasswordUsecase,
  RefreshUsecase,
  CreatePasswordUsecase,
  ChangePasswordUsecase,
} from 'src/use-cases';
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
    private readonly requestLoginOtpUsecase: RequestLoginOtpUsecase,
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
  @ApiCreatedResponseEnvelopeNull({
    description: 'User registered successfully',
  })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async register(@Body() dto: RegisterRequestDto): Promise<Envelope<null>> {
    await this.registerUsecase.execute(dto.email);
    return {
      statusCode: HttpStatus.CREATED,
      message:
        'User registered successfully. Please check your email for verification code.',
      data: null,
      metadata: null,
    };
  }

  @Post('verify-registration')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify registration OTP' })
  @ApiOkResponseEnvelope(VerifyRegistrationResponseDto, {
    description: 'Email verified successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP' })
  async verifyRegistration(
    @Body() dto: VerifyRegistrationRequestDto,
  ): Promise<Envelope<VerifyRegistrationResponseDto>> {
    const result = await this.verifyRegistrationUsecase.execute(
      dto.email,
      dto.otp,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Email verified successfully. You are now logged in.',
      data: result,
      metadata: null,
    };
  }

  @Post('request-login-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request OTP for passwordless login' })
  @ApiOkResponseEnvelopeNull({ description: 'OTP sent successfully' })
  @ApiResponse({ status: 400, description: 'User not found or unverified' })
  async requestLoginOtp(
    @Body() dto: RegisterRequestDto,
  ): Promise<Envelope<null>> {
    const result = await this.requestLoginOtpUsecase.execute(dto.email);
    return {
      statusCode: HttpStatus.OK,
      message: result.message,
      data: null,
      metadata: null,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login (Password or OTP)' })
  @ApiOkResponseEnvelope(LoginResponseDto, { description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials or OTP' })
  async login(
    @Body() dto: LoginRequestDto,
  ): Promise<Envelope<LoginResponseDto>> {
    const result = await this.loginUsecase.execute(dto.email, dto);
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
  @ApiOkResponseEnvelopeNull({ description: 'Reset code sent if email exists' })
  async forgotPassword(
    @Body() dto: ForgotPasswordRequestDto,
  ): Promise<Envelope<null>> {
    const result = await this.forgotPasswordUsecase.execute(
      dto.email,
      dto.isRecovery,
    );

    return {
      statusCode: 200,
      message: result.message,
      data: null,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };
  }

  @Post('verify-reset-password-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify reset OTP and get reset token' })
  @ApiOkResponseEnvelope(VerifyResetPasswordOtpResponseDto, {
    description: 'Reset token generated',
  })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP' })
  async verifyResetOtp(
    @Body() dto: VerifyResetPasswordOtpRequestDto,
  ): Promise<Envelope<VerifyResetPasswordOtpResponseDto>> {
    const result = await this.verifyResetPasswordOtpUsecase.execute(
      dto.email,
      dto.otp,
    );

    return {
      statusCode: 200,
      message: 'OK',
      data: {
        resetToken: result.resetToken,
      },
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with reset token' })
  @ApiOkResponseEnvelopeNull({ description: 'Password reset successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired reset token' })
  async resetPassword(
    @Body() dto: ResetPasswordRequestDto,
  ): Promise<Envelope<null>> {
    const result = await this.resetPasswordUsecase.execute(
      dto.newPassword,
      dto.resetToken,
    );

    return {
      statusCode: 200,
      message: result.message,
      data: null,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate access and refresh tokens' })
  @ApiOkResponseEnvelope(RefreshResponseDto, {
    description: 'Token refreshed successfully',
  })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  async refresh(
    @Body() dto: RefreshRequestDto,
  ): Promise<Envelope<RefreshResponseDto>> {
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
  @ApiOkResponseEnvelopeNull({ description: 'Password created successfully' })
  @ApiResponse({
    status: 400,
    description: 'Password already set or invalid input',
  })
  async createPassword(
    @Req() req: any,
    @Body() dto: CreatePasswordDto,
  ): Promise<Envelope<null>> {
    const result = await this.createPasswordUsecase.execute(
      req.user.sub,
      dto.password,
    );
    return {
      statusCode: HttpStatus.OK,
      message: result.message,
      data: null,
      metadata: null,
    };
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.USER, UserRole.MODERATOR)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change existing password' })
  @ApiOkResponseEnvelopeNull({ description: 'Password changed successfully' })
  @ApiResponse({
    status: 400,
    description: 'Incorrect old password or invalid input',
  })
  async changePassword(
    @Req() req: any,
    @Body() dto: ChangePasswordDto,
  ): Promise<Envelope<null>> {
    const result = await this.changePasswordUsecase.execute(
      req.user.sub,
      dto.oldPassword,
      dto.newPassword,
    );
    return {
      statusCode: HttpStatus.OK,
      message: result.message,
      data: null,
      metadata: null,
    };
  }
}
