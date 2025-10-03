import { Controller, Post, Get } from "@nestjs/common";
import { MatchmakingService } from "./matchmarking.service";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";

@ApiTags('Matchmaking') // Groups endpoints in Swagger UI
@Controller('matchmaking')
export class MatchmakingController {
  constructor(private readonly matchmakingService: MatchmakingService) {}

  /**
   * Manually trigger matchmaking (useful for testing)
   * POST /matchmaking/trigger
   */
  @Post('trigger')
  @ApiOperation({ summary: 'Manually trigger matchmaking scan' })
  @ApiResponse({ status: 200, description: 'Matchmaking scan completed successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async triggerMatchmaking() {
    return await this.matchmakingService.triggerManualMatchmaking();
  }

  /**
   * Get queue statistics
   * GET /matchmaking/queue-stats
   */
  @Get('queue-stats')
  @ApiOperation({ summary: 'Get current queue statistics' })
  @ApiResponse({
    status: 200,
    description: 'Returns statistics for players in queue',
    schema: {
      example: [
        {
          _id: { region: 'NA', mode: '1v1' },
          count: 10,
          avgRating: 1450,
          oldestJoinTime: '2025-10-03T21:00:00.000Z'
        }
      ]
    }
  })
  async getQueueStats() {
    return await this.matchmakingService.getQueueStats();
  }
}
