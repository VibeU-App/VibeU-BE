import { Controller, Get, Body, HttpCode, HttpStatus, Param, Patch, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Envelope } from '../core/envelope/envelope.interface';
import { ApiCreatedResponseEnvelope, ApiCreatedResponseEnvelopeNull, ApiOkResponseEnvelope } from 'src/core';
import { GetProfileMeResponseDto } from 'src/core/dtos/profile/get-profile-me.dto';
import { GetProfileMeUseCase } from 'src/use-cases/profile/get-profile-me.usecase';
import { UpdateProfileMeUseCase } from 'src/use-cases/profile/update-profile-me.usecase';
import { UpdateProfileTagsUseCase } from 'src/use-cases/profile/update-profile-tags.usecase';
import { UpdateProfileRequestDto, UpdateProfileResponseDto } from 'src/core/dtos/profile/update-profile.dto';
import { ProfileEntity } from 'src/core/entities';
import { UpdateProfileTagsRequestDto } from 'src/core/dtos/profile/update-profile-tags.dto';

@ApiTags('Profile')
@Controller('profile')
export class ProfileController {
    constructor(
        private readonly getProfileMeUsecase: GetProfileMeUseCase,
        private readonly updateProfileMeUsecase: UpdateProfileMeUseCase,
        private readonly updateProfileTagsUsecase: UpdateProfileTagsUseCase,
    ) {}

    @Get('me/:userId')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Fetch a user's profile" })
    @ApiOkResponseEnvelope(GetProfileMeResponseDto, { description: 'Profile fetched successfully' })
    @ApiResponse({ status: 400, description: 'Profile not found'})
    async getProfileMe(@Param('userId') userId: string): Promise<Envelope<GetProfileMeResponseDto>> {
        const result = await this.getProfileMeUsecase.execute(userId);

        return {
            statusCode: HttpStatus.OK,
            message: 'Profile successfully found',
            data: result,
            metadata: null,
        }
    }

    @Patch('me')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: "Update a user's profile" })
    @ApiCreatedResponseEnvelope(UpdateProfileResponseDto, { description: 'Profile successfully updated' })
    @ApiResponse({ status: 400, description: "Profile can't be found or invalid data" })
    async updateProfile(@Body() dto: UpdateProfileRequestDto): Promise<Envelope<ProfileEntity>> {
        const result = await this.updateProfileMeUsecase.execute(dto.userId, dto);
        
        return {
            statusCode: HttpStatus.CREATED,
            message: 'Profile successfully updated',
            data: result,
            metadata: null,
        }
    }

    @Put('me/tags')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: "Update a user's tag list" })
    @ApiCreatedResponseEnvelopeNull({ description: 'Tag list successfully updated' })
    @ApiResponse({ status: 400, description: "Profile can't be found, or the length of the tag list is invalid" })
    async updateProfileTags(@Body() dto: UpdateProfileTagsRequestDto): Promise<Envelope<null>> {
        await this.updateProfileTagsUsecase.execute(dto.userId, dto.hobbyIds);

        return {
            statusCode: HttpStatus.CREATED,
            message: 'Profile tags successfully updated',
            data: null,
            metadata: null,
        }
    }
}
