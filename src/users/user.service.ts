import { Injectable,Logger,UnauthorizedException,BadRequestException,Inject } from "@nestjs/common";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { User } from "src/schema/user.schema";
import { UserDto } from "./dto/user.dto";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import type { Cache } from "cache-manager";
import { encrypt,decrypt } from "src/middlewares/encryption/encrypt";



interface CacheUser{
  id:number;
  username:string;
  region:string;
}

@Injectable()
export class UserService{
  constructor(@InjectModel(User.name) private userModel:Model<User>,
  @Inject(CACHE_MANAGER) private cacheManager:Cache
  ){}

  private logger=new Logger('UserService');

  async createUser(username:string,
    region:string,
    status:string,
    rating?:number,
  ):Promise<{User:string}>{

    // I have to check the cache 
    const userCache = await this.cacheManager.get<CacheUser>(`user:${username}`);
    if(userCache){
      throw new BadRequestException('Username already exists');
    }

    const existingUser = await this.userModel.findOne({username});
    if(existingUser){
      throw new BadRequestException('Username already exists');
    }

    //I will have to encrypt the region, rating and status 
    const newRegion=encrypt(region);
    const newStatus=encrypt(status);
    const newRating= encrypt(rating || 1200 );
    // Create the user

    const newUser = new this.userModel({
      username,
      newRegion,
      newStatus,
      newRating,
    })
    const savedUser = await newUser.save();

    // Store the user in the cache
    await this.cacheManager.set(`user:${username}`, {
      id: savedUser._id,
      username: savedUser.username,
      region: savedUser.region,
    },3600); // Cache for 1 hour
    this.logger.log(`User created: ${username}`);
    return {User:`User ${username} created successfully`};
  }

}