import { Injectable,Logger,UnauthorizedException,BadRequestException,Inject } from "@nestjs/common";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { Queue } from "src/schema/queue.schema";
import { User } from "src/schema/user.schema";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import type { Cache } from "cache-manager";
import { encrypt,decrypt } from "src/middlewares/encryption/encrypt";



interface CacheQueue{
  username:string;
  region:string;
}


export class QueueService{
  constructor(@InjectModel(Queue.name) private queueModel:Model<Queue>,
  @InjectModel(User.name) private userModel:Model<User>,
  @Inject(CACHE_MANAGER) private cacheManager:Cache
  ){}

  private logger = new Logger('QueueService');


  async addToQueue(userId:string,mode:string):Promise<{Queue:string}>{
    //I want to check if the user exists in the user database 
    const existingUser = await this.userModel.findById(userId);
    if(!existingUser){
      throw new BadRequestException('User does not exist');
    }
    //I want to check queue for existing user
    const alreadyInQueue = await this.queueModel.findOne({userId});
    if(alreadyInQueue){ 
      throw new BadRequestException('User already in queue');
    }
    // decrypt the region and the status fields 
    const decryptedRegion = decrypt(existingUser.region);
    const decryptedStatus = decrypt(existingUser.status);
    // check if the user status is idle
    if(decryptedStatus !== 'idle'){
      throw new BadRequestException('User is not idle');
    }
    
    //Now I want to add the user to the queue
    const newQueueEntry = new this.queueModel({
      userId,
      username:existingUser.username,
      rating:existingUser.rating,
      region:"Searching",
      mode,
      joinedAt:new Date()
    });
    await newQueueEntry.save();

    await this.cacheManager.set<CacheQueue>(`queue:${existingUser.username}`, {
      username: existingUser.username,
      region: decryptedRegion,
    },3600 ); // Cache for 1 hour
    return {Queue:'User added to queue successfully'};
  }

  
}