import {
  Controller,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  Patch,
  Put,
  UseGuards,
  Req,
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
} from 'src/core';
import { GetProfileMeResponseDto } from 'src/core/dtos/profile/get-profile-me.dto';
import { GetProfileMeUseCase } from 'src/use-cases/profile/get-profile-me.usecase';
import { UpdateProfileMeUseCase } from 'src/use-cases/profile/update-profile-me.usecase';
import { UpdateProfileTagsUseCase } from 'src/use-cases/profile/update-profile-tags.usecase';
import {
  UpdateProfileRequestDto,
  UpdateProfileResponseDto,
} from 'src/core/dtos/profile/update-profile.dto';
import { UpdateProfileTagsRequestDto } from 'src/core/dtos/profile/update-profile-tags.dto';
import { JwtAuthGuard } from 'src/middleware/jwt-auth.guard';

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
    @Req() req: any,
  ): Promise<Envelope<GetProfileMeResponseDto>> {
    const result = await this.getProfileMeUsecase.execute(req.user.sub);

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
    @Req() req: any,
    @Body() dto: UpdateProfileRequestDto,
  ): Promise<Envelope<UpdateProfileResponseDto>> {
    const result = await this.updateProfileMeUsecase.execute(req.user.sub, dto);

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
    @Req() req: any,
    @Body() dto: UpdateProfileTagsRequestDto,
  ): Promise<Envelope<null>> {
    await this.updateProfileTagsUsecase.execute(req.user.sub, dto.hobbyIds);

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Profile tags successfully updated',
      data: null,
      metadata: null,
    };
  }
}
