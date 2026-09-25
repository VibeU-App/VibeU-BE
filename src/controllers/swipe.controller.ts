import {
  Controller,
  Get,
  Body,
  HttpStatus,
  Post,
  UseGuards,
  Delete,
  HttpCode,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  CreateSwipeUseCase,
  GetMatchesUseCase,
  GetSwipeDeckUseCase,
  UnmatchUseCase,
} from '../use-cases';
import {
  ApiTags,
  ApiResponse,
  ApiBearerAuth,
  ApiOperation,
} from '@nestjs/swagger';
import { Envelope } from '../core/envelope/envelope.interface';
import { JwtAuthGuard } from 'src/middleware/jwt-auth.guard';
import { ApiCreatedResponseEnvelope, ApiOkResponseEnvelope } from 'src/core';
import {
  CreateSwipeRequestDto,
  CreateSwipeResponseDto,
} from 'src/core/dtos/swipe/create-swipe.dto';
import { CurrentUser } from 'src/middleware/current-user.decorator';
import { TokenPayload } from 'src/middleware/token-payload.interface';
import {
  GetSwipeDeckQueryDto,
  GetSwipeDeckResponseDto,
} from 'src/core/dtos/swipe/get-swipe-deck-query.dto';
import { UnmatchResponseDto } from 'src/core/dtos/swipe/unmatch.dto';
import { GetMatchesResponseDto } from 'src/core/dtos/swipe/get-matches.dto';
import { MatchParamDto } from 'src/core/dtos/swipe/match-param.dto';

@ApiTags('Swipes')
@Controller('swipes')
export class SwipeController {
  constructor(
    private readonly createSwipeUsecase: CreateSwipeUseCase,
    private readonly getMatchesUsecase: GetMatchesUseCase,
    private readonly getSwipeDeckUsecase: GetSwipeDeckUseCase,
    private readonly unmatchUsecase: UnmatchUseCase,
  ) {}

  @Post('')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new swipe' })
  @ApiCreatedResponseEnvelope(CreateSwipeResponseDto, {
    description: 'Swipe successfully created',
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot swipe on user of the same sex',
  })
  @ApiResponse({
    status: 407,
    description: 'You have already swiped on this profile',
  })
  async createSwipe(
    @CurrentUser() user: TokenPayload,
    @Body() dto: CreateSwipeRequestDto,
  ): Promise<Envelope<CreateSwipeResponseDto>> {
    const result = await this.createSwipeUsecase.execute(
      user.sub,
      dto.targetId,
      dto.isLike,
    );

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Swipe successfully created',
      data: {
        swipe: result.swipe,
        isMatch: result.isMatch,
      },
      metadata: null,
    };
  }

  @Get('deck')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Retrieve the candidate deck' })
  @ApiOkResponseEnvelope(GetSwipeDeckResponseDto, {
    description: 'Candidate deck fetched successfully',
  })
  async getSwipeDeck(
    @CurrentUser() user: TokenPayload,
  ): Promise<Envelope<GetSwipeDeckResponseDto>> {
    const result = await this.getSwipeDeckUsecase.execute(user.sub);
    return {
      statusCode: HttpStatus.OK,
      message: 'Candidate deck successfully fetched',
      data: {
        candidateDeck: result,
      },
      metadata: null,
    };
  }

  @Get('matches')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Retrieve matches' })
  @ApiOkResponseEnvelope(GetMatchesResponseDto, {
    description: 'Matches successfully fetched',
  })
  async getMatches(
    @CurrentUser() user: TokenPayload,
  ): Promise<Envelope<GetMatchesResponseDto>> {
    const result = await this.getMatchesUsecase.execute(user.sub);
    return {
      statusCode: HttpStatus.OK,
      message: 'Matches successfully fetched',
      data: {
        matches: result,
      },
      metadata: null,
    };
  }

  @Delete('matches/:matchId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a match' })
  @ApiOkResponseEnvelope(UnmatchResponseDto, {
    description: 'Match deleted successfully',
  })
  async unmatch(
    @Param('matchId', ParseUUIDPipe) matchId: string,
  ): Promise<Envelope<UnmatchResponseDto>> {
    const result = await this.unmatchUsecase.execute(matchId);

    return {
      statusCode: HttpStatus.NO_CONTENT,
      message: 'Match successfully deleted',
      data: {
        result: result.result,
      },
      metadata: null,
    };
  }
}
