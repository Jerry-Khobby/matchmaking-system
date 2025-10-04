// matchmaking.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Queue } from 'src/schema/queue.schema';
import { Match } from 'src/schema/match.schema';
import { User } from 'src/schema/user.schema';
import { encrypt } from 'src/middlewares/encryption/encrypt';

@Injectable()
export class MatchmakingService {
  private readonly logger = new Logger(MatchmakingService.name);

  constructor(
    @InjectModel(Queue.name) private queueModel: Model<Queue>,
    @InjectModel(Match.name) private matchModel: Model<Match>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  /**
   * This runs automatically every 10 seconds to check for matches
   * Uses NestJS @Cron decorator
   */
  @Cron(CronExpression.EVERY_10_SECONDS)
  async runMatchmaking() {
    this.logger.log('🔍 Starting matchmaking scan...');

    try {
      // Find matches for different game modes
      await this.find1v1Matches();
      // Add more modes later: await this.find2v2Matches();
    } catch (error) {
      this.logger.error('❌ Matchmaking error:', error);
    }
  }

  /**
   * CORE MATCHMAKING LOGIC FOR 1v1
   * This is the brain of your system!
   */
  async find1v1Matches() {
    this.logger.log('🎮 Checking for 1v1 matches...');

    // Step 1: Get all players waiting in 1v1 queue, grouped by region
    const queuedPlayers = await this.queueModel.aggregate([
      // Only get 1v1 players
      { $match: { mode: '1v1' } },
      
      // Sort by who joined first (FIFO - First In First Out)
      { $sort: { joinedAt: 1 } },
      
      // Group by region (NA players with NA, EU with EU)
      {
        $group: {
          _id: '$region',
          players: { $push: '$$ROOT' }
        }
      }
    ]);

    this.logger.log(`Found ${queuedPlayers.length} regional groups`);

    // Step 2: For each region, try to match players
    for (const regionGroup of queuedPlayers) {
      const region = regionGroup._id;
      const players = regionGroup.players;

      this.logger.log(`📍 Region ${region}: ${players.length} players waiting`);

      // Need at least 2 players to make a match
      if (players.length < 2) {
        this.logger.log(`⏳ Not enough players in ${region} region`);
        continue;
      }

      // Step 3: Try to pair players
      await this.pairPlayers(players);
    }
  }

  /**
   * PAIRING ALGORITHM
   * Takes a list of players and creates matches
   */
  async pairPlayers(players: any[]) {
    const matched = new Set(); // Track who's been matched

    // Loop through all players
    for (let i = 0; i < players.length; i++) {
      // Skip if already matched
      if (matched.has(i)) continue;

      const player1 = players[i];

      // Try to find a compatible opponent
      for (let j = i + 1; j < players.length; j++) {
        if (matched.has(j)) continue;

        const player2 = players[j];

        // Check if they're compatible
        const isCompatible = this.arePlayersCompatible(player1, player2);

        if (isCompatible) {
          this.logger.log(
            `✅ MATCH FOUND: ${player1.username} (${player1.rating}) vs ${player2.username} (${player2.rating})`
          );

          // Create the match!
          await this.createMatch([player1, player2], '1v1');

          // Mark both as matched
          matched.add(i);
          matched.add(j);
          break; // player1 is matched, move to next player
        }
      }

      // If player1 wasn't matched, check if they've been waiting too long
      if (!matched.has(i)) {
        await this.handleLongWait(player1);
      }
    }
  }

  /**
   * COMPATIBILITY CHECK
   * Determines if two players should be matched
   */
  arePlayersCompatible(player1: any, player2: any): boolean {
    // Rule 1: Same region (already filtered, but double-check)
    if (player1.region !== player2.region) {
      return false;
    }

    // Rule 2: Similar rating (±100 points for fair match)
    const ratingDifference = Math.abs(player1.rating - player2.rating);
    const RATING_TOLERANCE = 100;

    if (ratingDifference > RATING_TOLERANCE) {
      this.logger.debug(
        `❌ ${player1.username} vs ${player2.username}: Rating diff too high (${ratingDifference})`
      );
      return false;
    }

    // Rule 3: Check how long they've been waiting
    // If waiting >30s, be more lenient with rating
    const player1WaitTime = Date.now() - new Date(player1.joinedAt).getTime();
    const player2WaitTime = Date.now() - new Date(player2.joinedAt).getTime();
    const avgWaitTime = (player1WaitTime + player2WaitTime) / 2;

    if (avgWaitTime > 30000) {
      // After 30 seconds, allow ±200 rating difference
      if (ratingDifference > 200) {
        return false;
      }
    }

    // All checks passed!
    return true;
  }

  /**
   * MATCH CREATION
   * Creates a match document and updates all related records
   */
  async createMatch(players: any[], mode: string) {
    const session = await this.queueModel.db.startSession();
    session.startTransaction();

    try {
      // Step 1: Create the match document
      const match = new this.matchModel({
        mode,
        status: 'pending',
        players: players.map(p => ({
          userId: p.userId,
          username: p.username,
          rating: p.rating,
        })),
        createdAt: new Date(),
      });

      await match.save({ session });
      this.logger.log(`🎮 Match created: ${match._id}`);

      // Step 2: Remove both players from queue
      const userIds = players.map(p => p.userId);
      await this.queueModel.deleteMany(
        { userId: { $in: userIds } },
        { session }
      );
      this.logger.log(`🗑️ Removed ${userIds.length} players from queue`);

      // Step 3: Update user statuses to "in_match"
      const encryptedStatus = encrypt('in_match');
      await this.userModel.updateMany(
        { _id: { $in: userIds } },
        { status: encryptedStatus },
        { session }
      );
      this.logger.log(`✏️ Updated ${userIds.length} user statuses to "in_match"`);

      // Step 4: Add match to user's match history
      await this.userModel.updateMany(
        { _id: { $in: userIds } },
        { $push: { matchHistory: match._id } },
        { session }
      );

      // Commit all changes atomically
      await session.commitTransaction();

      this.logger.log(`✅ Match ${match._id} successfully created!`);

      // TODO: Send WebSocket notification to both players
      // this.notifyPlayersMatchFound(match);

      return match;
    } catch (error) {
      // If anything fails, rollback everything
      await session.abortTransaction();
      this.logger.error('❌ Failed to create match:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * HANDLE LONG WAIT TIMES
   * Players waiting too long might need special treatment
   */
  async handleLongWait(player: any) {
    const waitTime = Date.now() - new Date(player.joinedAt).getTime();
    const waitSeconds = Math.floor(waitTime / 1000);

    if (waitSeconds > 60) {
      this.logger.warn(
        `⏰ ${player.username} has been waiting for ${waitSeconds}s in ${player.region}`
      );

      // Option 1: Try matching with nearby regions
      // Option 2: Send notification to player about long wait
      // Option 3: Give priority in next matching cycle
      
      // For now, just log it
      // You can implement these features later
    }
  }

  /**
   * MANUAL TRIGGER (for testing)
   * Call this from a controller endpoint
   */
  async triggerManualMatchmaking() {
    this.logger.log('🔧 Manual matchmaking triggered');
    await this.runMatchmaking();
    return { message: 'Matchmaking scan completed' };
  }

  /**
   * GET QUEUE STATISTICS
   * Useful for monitoring your system
   */
  async getQueueStats() {
    const stats = await this.queueModel.aggregate([
      {
        $group: {
          _id: {
            region: '$region',
            mode: '$mode'
          },
          count: { $sum: 1 },
          avgRating: { $avg: '$rating' },
          oldestJoinTime: { $min: '$joinedAt' }
        }
      }
    ]);

    return stats;
  }
}