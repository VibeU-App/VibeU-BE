import {
  Controller,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  Patch,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Envelope } from '../core/envelope/envelope.interface';
import {
  ApiCreatedResponseEnvelope,
  ApiCreatedResponseEnvelopeNull,
  ApiOkResponseEnvelope,
} from '../core/envelope/envelope.decorator';
import {
  GetProfileMeUseCase,
  UpdateProfileMeUseCase,
  UpdateProfileTagsUseCase,
} from '../use-cases';
import {
  GetProfileMeResponseDto,
  UpdateProfileRequestDto,
  UpdateProfileResponseDto,
  UpdateProfileTagsRequestDto,
} from '../core/dtos';
import { JwtAuthGuard } from '../middleware/jwt-auth.guard';
import { CurrentUser } from '../middleware/current-user.decorator';
import { TokenPayload } from '../middleware/token-payload.interface';

@ApiTags('Profile')
@Controller('profile')
export class ProfileController {
  constructor(
    private readonly getProfileMeUsecase: GetProfileMeUseCase,
    private readonly updateProfileMeUsecase: UpdateProfileMeUseCase,
    private readonly updateProfileTagsUsecase: UpdateProfileTagsUseCase,
  ) {}

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Fetch a user's profile" })
  @ApiOkResponseEnvelope(GetProfileMeResponseDto, {
    description: 'Profile fetched successfully',
  })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  async getProfileMe(
    @CurrentUser() user: TokenPayload,
  ): Promise<Envelope<GetProfileMeResponseDto>> {
    const result = await this.getProfileMeUsecase.execute(user.sub);

    return {
      statusCode: HttpStatus.OK,
      message: 'Profile successfully found',
      data: result,
      metadata: null,
    };
  }

  @Patch('me')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update a user's profile" })
  @ApiCreatedResponseEnvelope(UpdateProfileResponseDto, {
    description: 'Profile successfully updated',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid profile data',
  })
  @ApiResponse({
    status: 404,
    description: "Profile can't be found",
  })
  async updateProfile(
    @CurrentUser() user: TokenPayload,
    @Body() dto: UpdateProfileRequestDto,
  ): Promise<Envelope<UpdateProfileResponseDto>> {
    const result = await this.updateProfileMeUsecase.execute(user.sub, dto);

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Profile successfully updated',
      data: { profile: result },
      metadata: null,
    };
  }

  @Put('me/tags')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update a user's tag list" })
  @ApiCreatedResponseEnvelopeNull({
    description: 'Tag list successfully updated',
  })
  @ApiResponse({
    status: 400,
    description: 'The length of the tag list is invalid',
  })
  @ApiResponse({
    status: 404,
    description: "Profile can't be found",
  })
  async updateProfileTags(
    @CurrentUser() user: TokenPayload,
    @Body() dto: UpdateProfileTagsRequestDto,
  ): Promise<Envelope<null>> {
    await this.updateProfileTagsUsecase.execute(user.sub, dto.hobbyIds);

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Profile tags successfully updated',
      data: null,
      metadata: null,
    };
  }
}
