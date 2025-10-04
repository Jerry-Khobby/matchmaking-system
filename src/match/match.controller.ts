import { 
  Controller, 
  Get, 
  Post, 
  Param, 
  Body, 
  Query,
  HttpCode,
  HttpStatus 
} from '@nestjs/common';

import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';

import { MatchService } from './match.service';

@ApiTags('Matches')
@Controller('matches')
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  /**
   * Get all matches with pagination
   * GET /matches?page=1&limit=10
   */
  @Get()
  @ApiOperation({ summary: 'Get all matches with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of matches returned successfully' })
  async getAllMatches(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return await this.matchService.getAllMatches(
      page ? Number(page) : 1,
      limit ? Number(limit) : 10,
    );
  }

  /**
   * Get specific match by ID
   * GET /matches/:id
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get a specific match by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Match found successfully' })
  @ApiResponse({ status: 404, description: 'Match not found' })
  async getMatchById(@Param('id') id: string) {
    return await this.matchService.getMatchById(id);
  }

  /**
   * Get active matches
   * GET /matches/active/all
   */
  @Get('active/all')
  @ApiOperation({ summary: 'Get all active matches' })
  @ApiResponse({ status: 200, description: 'Active matches returned successfully' })
  async getActiveMatches() {
    return await this.matchService.getActiveMatches();
  }

  /**
   * Get user's match history
   * GET /matches/history/:userId
   */
  @Get('history/:userId')
  @ApiOperation({ summary: "Get a user's match history" })
  @ApiParam({ name: 'userId', type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'User match history returned successfully' })
  async getUserMatchHistory(
    @Param('userId') userId: string,
    @Query('limit') limit?: number,
  ) {
    return await this.matchService.getUserMatchHistory(
      userId,
      limit ? Number(limit) : 10,
    );
  }

  /**
   * Start a match
   * POST /matches/:id/start
   */
  @Post(':id/start')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Start a match' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Match started successfully' })
  async startMatch(@Param('id') id: string) {
    return await this.matchService.startMatch(id);
  }

  /**
   * Finish a match and update ratings
   * POST /matches/:id/finish
   */
  @Post(':id/finish')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Finish a match and update ratings' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        winnerId: { type: 'string' },
        loserId: { type: 'string' },
      },
      required: ['winnerId', 'loserId'],
    },
  })
  @ApiResponse({ status: 200, description: 'Match finished and ratings updated' })
  async finishMatch(
    @Param('id') id: string,
    @Body() body: { winnerId: string; loserId: string },
  ) {
    return await this.matchService.finishMatch(
      id,
      body.winnerId,
      body.loserId,
    );
  }

  /**
   * Cancel a match (admin/error handling)
   * POST /matches/:id/cancel
   */
  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel a match' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Match cancelled successfully' })
  async cancelMatch(@Param('id') id: string) {
    return await this.matchService.cancelMatch(id);
  }
}
