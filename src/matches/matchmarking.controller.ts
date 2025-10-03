import { Controller,Post,Get } from "@nestjs/common";
import { MatchmakingService } from "./matchmarking.service";
import { ApiTags } from "@nestjs/swagger";


@Controller('matchmaking')
export class MatchmakingController {
  constructor(private readonly matchmakingService: MatchmakingService) {}

  /**
   * Manually trigger matchmaking (useful for testing)
   * POST /matchmaking/trigger
   */
  @Post('trigger')
  async triggerMatchmaking() {
    return await this.matchmakingService.triggerManualMatchmaking();
  }

  /**
   * Get queue statistics
   * GET /matchmaking/queue-stats
   */
  @Get('queue-stats')
  async getQueueStats() {
    return await this.matchmakingService.getQueueStats();
  }
}