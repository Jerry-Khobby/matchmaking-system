import { Injectable, Logger, BadRequestException, NotFoundException, Inject } from "@nestjs/common";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { Queue } from "src/schema/queue.schema";
import { User } from "src/schema/user.schema";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import type { Cache } from "cache-manager";
import { decrypt } from "src/middlewares/encryption/encrypt";

interface CacheQueue {
  username: string;
  region: string;
}

@Injectable()  // 👈 Missing decorator
export class QueueService {
  constructor(
    @InjectModel(Queue.name) private queueModel: Model<Queue>,
    @InjectModel(User.name) private userModel: Model<User>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  private logger = new Logger("QueueService");

  async addToQueue(userId: string, mode: string): Promise<{ Queue: string }> {
    const existingUser = await this.userModel.findById(userId);
    if (!existingUser) throw new NotFoundException("User does not exist");

    const alreadyInQueue = await this.queueModel.findOne({ userId });
    if (alreadyInQueue) throw new BadRequestException("User already in queue");

    const decryptedRegion = decrypt(existingUser.region);
    const decryptedStatus = decrypt(existingUser.status);
    
    if(decryptedStatus === "in_match"){
      throw new BadRequestException("User is currently in a match");
    }

    if (decryptedStatus !== "idle") {
      throw new BadRequestException("User is not idle");
    }

    const newQueueEntry = new this.queueModel({
      userId,
      username: existingUser.username,
      rating: existingUser.rating,
      region: "Searching",
      mode,
      joinedAt: new Date(),
    });

    await newQueueEntry.save();

    await this.cacheManager.set<CacheQueue>(
      `queue:${existingUser.username}`,
      {
        username: existingUser.username,
        region: decryptedRegion,
      },
      3600
    );

    return { Queue: "User added to queue successfully" };
  }

  async leaveQueue(userId: string): Promise<{ Queue: string }> {
    const existingUser = await this.userModel.findById(userId);
    if (!existingUser) throw new NotFoundException("User does not exist");

    const alreadyInQueue = await this.queueModel.findOne({ userId });
    if (!alreadyInQueue) throw new BadRequestException("User not in queue");

    await this.queueModel.deleteOne({ userId });
    await this.cacheManager.del(`queue:${existingUser.username}`);

    return { Queue: "User removed from queue successfully" };
  }
}
