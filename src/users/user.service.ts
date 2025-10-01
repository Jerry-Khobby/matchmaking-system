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

async createUser(
  username: string,
  region: string,
  status: string,
  rating?: number,
): Promise<{ User: string }> {
  // Check the cache
  const userCache = await this.cacheManager.get<CacheUser>(`user:${username}`);
  if (userCache) {
    throw new BadRequestException('Username already exists');
  }

  const existingUser = await this.userModel.findOne({ username });
  if (existingUser) {
    throw new BadRequestException('Username already exists');
  }

  // Encrypt sensitive fields
  const encryptedRegion = encrypt(region);
  const encryptedStatus = encrypt(status);
  const encryptedRating = encrypt(rating || 1200);

  // Create the user with correct schema fields
  const newUser = new this.userModel({
    username,
    region: encryptedRegion.toString('hex'),
    status: encryptedStatus.toString('hex'),
    rating: rating || 1200,
  });

  const savedUser = await newUser.save();

  // Store in cache (better to store raw values here, not encrypted)
  await this.cacheManager.set(
    `user:${username}`,
    {
      id: savedUser.id.toString(),
      username: savedUser.username,
      region: region, // keep region human-readable in cache
    },
    3600,
  );

  this.logger.log(`User created: ${username}`);
  return { User: `User ${username} created successfully` };
}


}