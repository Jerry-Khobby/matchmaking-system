import { Injectable,Logger,NotFoundException,BadRequestException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Match } from "src/schema/match.schema";
import { User } from "src/schema/user.schema";
import { encrypt } from "src/middlewares/encryption/encrypt";


@Injectable()
export class MatchService{
  private readonly logger = new Logger(MatchService.name);

  constructor(
    @InjectModel(Match.name) private matchModel: Model<Match>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}


    /**
   * ELO RATING CALCULATION
   * Standard chess ELO algorithm adapted for games
   */
  calculateELO(winnerRating: number, loserRating: number): {
    newWinnerRating: number;
    newLoserRating: number;
    ratingChange: number;
  } {
    const K = 32; // K-factor (how much ratings change per game)

    // Expected probability of winning
    const expectedWinner = 1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));
    const expectedLoser = 1 / (1 + Math.pow(10, (winnerRating - loserRating) / 400));

    // Actual scores (1 for win, 0 for loss)
    const actualWinner = 1;
    const actualLoser = 0;

    // Calculate rating changes
    const winnerChange = Math.round(K * (actualWinner - expectedWinner));
    const loserChange = Math.round(K * (actualLoser - expectedLoser));

    return {
      newWinnerRating: winnerRating + winnerChange,
      newLoserRating: loserRating + loserChange,
      ratingChange: winnerChange,
    };
  }
  /** GET MATCH BY 
   * Returns match details with decrypted player info 
   */
  async getMatchById(matchId:string):Promise<any>{
    const match = await this.matchModel.findById(matchId);
    if(!match){
      throw new NotFoundException('Match not found');
    }
    return match;
  }
  /** GET ALL MATCHES (with pagination) */
  async getAllMatches(page:number=1,limit:number=10):Promise<any>{
    const skip = (page -1)*limit;
    const matches = await this.matchModel
    .find()
    .skip(skip)
    .limit(limit)
    .sort({createdAt:-1});
    const total = await this.matchModel.countDocuments();

    return {
      matches,
      pagination:{
        total,
        page,
        pages:Math.ceil(total/limit)
      }
    }
    
  }
  /** START A MATCH
   * Changes status from "pending" to "active"
   * 
   */
  async startMatch(matchId:string):Promise<any>{
    const match = await this.matchModel.findById(matchId);
    if(!match){
      throw new NotFoundException('Match not found');
    }
    if(match.status !== 'pending'){
      throw new BadRequestException(`cannot start match with status ${match.status}`);
    }
    match.status = 'active';
    await match.save();
    this.logger.log(`Match ${matchId} started`);
    return {
      message:"Match started successfully",
      matchId:match._id,
      status:match.status
    }
  }

  /** FINISH A MATCH 
   * 
   * Updates ratings using ELO system 
  */
 async finishMatch(matchId:string,winnerId:string,loserId:string):Promise<any>{
  const match = await this.matchModel.findById(matchId);
  if(!match){
    throw new NotFoundException('Match not found');
  }
  if(match.status!=='finished'){
    throw new BadRequestException("Match already finished");
  }
  const playerIds = match.players.map(p=>p.userId.toString());
  if(!playerIds.includes(winnerId) || !playerIds.includes(loserId)){
    throw new BadRequestException('Invalid player IDs for this match');
  }
    // Get current ratings
    const winner = await this.userModel.findById(winnerId);
    const loser = await this.userModel.findById(loserId);
  if (!winner || !loser) {
      throw new NotFoundException('Player not found');
    }
    const { newWinnerRating, newLoserRating, ratingChange } = 
    this.calculateELO(winner.rating, loser.rating);

    const session = await this.matchModel.db.startSession();
    session.startTransaction();
    try{
      match.status = 'finished';
      match.winner = winnerId;
      match.result={
        winnerRating: newWinnerRating,
        loserRating: newLoserRating,
        ratingChange,
      }
      await match.save({session});
      await this.userModel.findByIdAndUpdate(
        winnerId,
        { rating: newWinnerRating },
        { session }
      );
      await this.userModel.findByIdAndUpdate(
        loserId,
        { rating: newLoserRating },
        { session }
      )
      const encryptedIdle = encrypt('idle');
      await this.userModel.updateMany(
        { _id: { $in: [winnerId, loserId] } },
        { status: encryptedIdle },
        { session }
      );
      await session.commitTransaction();

      this.logger.log(`✅ Match ${matchId} finished`)
      this.logger.log(
        `📊 Ratings: Winner ${winner.rating} → ${newWinnerRating} (+${ratingChange})`
      );
      this.logger.log(
        `📊 Ratings: Loser ${loser.rating} → ${newLoserRating} (-${ratingChange})`
      );
        return {
        message: 'Match finished successfully',
        matchId: match._id,
        winner: {
          userId: winnerId,
          oldRating: winner.rating,
          newRating: newWinnerRating,
          change: ratingChange,
        },
        loser: {
          userId: loserId,
          oldRating: loser.rating,
          newRating: newLoserRating,
          change: -ratingChange,
        }
      };

    }catch(error){
      await session.abortTransaction();
      this.logger.error('Failed to finish match:', error);
      throw error;
    }
 }
 /** GET USER'S MATCH HISTORY */
   async getUserMatchHistory(userId: string, limit: number = 10): Promise<any> {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const matches = await this.matchModel
      .find({
        'players.userId': userId,
        status: 'finished'
      })
      .sort({ createdAt: -1 })
      .limit(limit);

    return matches;
  }

    /**
   * GET ACTIVE MATCHES
   * Returns all currently active matches
   */
  async getActiveMatches(): Promise<any> {
    return await this.matchModel.find({ status: 'active' });
  }


    /**
   * CANCEL A MATCH (if needed)
   * For error handling or admin actions
   */
  async cancelMatch(matchId: string): Promise<any> {
    const match = await this.matchModel.findById(matchId);

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    if (match.status === 'finished') {
      throw new BadRequestException('Cannot cancel finished match');
    }

    const session = await this.matchModel.db.startSession();
    session.startTransaction();

    try {
      // Update match status
      match.status = 'cancelled';
      await match.save({ session });

      // Update player statuses back to idle
      const playerIds = match.players.map(p => p.userId);
      const encryptedIdle = encrypt('idle');
      
      await this.userModel.updateMany(
        { _id: { $in: playerIds } },
        { status: encryptedIdle },
        { session }
      );

      await session.commitTransaction();

      this.logger.log(`❌ Match ${matchId} cancelled`);

      return {
        message: 'Match cancelled successfully',
        matchId: match._id,
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

}